import { useEffect, useState } from 'react';
import { 
  Pressable, 
  SafeAreaView,
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  TextInput,
  FlatList
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

const db = SQLite.openDatabase("bmiDB.db");

export default function App() {
  const [height, setHeight] = useState(0); // no div by zero
  const [weight, setWeight] = useState(0);
  const [BMI, setBMI] = useState(0);
  const [showBMI, setShowBMI] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const asyncEffect = async () => {
      db.transaction((tx) => {
        tx.executeSql(
          //"DROP TABLE entries",
          "CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY NOT NULL, height INTEGER, weight INTEGER, entryDate DATE);",
          [],
          () => {console.log("Table operation successful")},
          (tx, err) => console.log(err)
        );
        tx.executeSql(
          "SELECT * FROM entries",
          [],
          (_, result) => {
            const list = []
            for (let i = 0; i < result.rows.length; i++) {
              list[i] = result.rows.item(i);
            }
            setEntries(list);
            console.log("Retrieved entries:");
            console.log(list);
            console.log("Stored entries:");
            console.log(entries);
          },
          (tx, err) => console.log(err)
        )
      });
      
    };
    asyncEffect();
  }, [])

  const computeBMI = async () => {
    setBMI((weight / (height * height)) * 703);
    setShowBMI(true);
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO entries (height, weight, entryDate) values (?, ?, Date('now'));",
        [height, weight],
        () => console.log("Insert successful"),
        (tx, err) => console.log(err)
      );
    });
  }

  const getCategory = () => {
    if (BMI < 18.5)
      return "Underweight"
    else if (BMI < 25)
      return "Healthy"
    else if (BMI < 30)
      return "Overweight"
    else
      return "Obese"

  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.toolbar}>BMI Calculator</Text>
      <ScrollView style={styles.content}>
        <TextInput 
          style={styles.input} 
          placeholder={'Weight in Pounds'} 
          onChangeText={text => setWeight(parseInt(text))}>
        </TextInput>
        <TextInput 
          style={styles.input} 
          placeholder={'Height in Inches'} 
          onChangeText={text => setHeight(parseInt(text))}>
        </TextInput>
        <Pressable style={styles.button} onPress={computeBMI}><Text style={styles.buttonText}>Compute BMI</Text></Pressable>
        { showBMI 
          ? <Text style={styles.result}>Body Mass Index is {(BMI).toFixed(1)} ({getCategory()})</Text>
          : <Text style={styles.result}/>
        }
        { entries != null && entries.length > 0 
          ? <View>
            <Text style={styles.histTitle}>BMI History</Text>
            { entries.map((entry, index) => {
             return (<Text style={styles.histText} key={index}>{entry.entryDate}:   {((entry.weight / (entry.height * entry.height)) * 703).toFixed(1)} (W:{entry.weight}, H:{entry.height})</Text>)
            })}
          </View>
          
          : <Text/>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    padding: 25,
    fontSize: 28,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 10,
  },
  preview: {
    backgroundColor: '#bdc3c7',
    flex: 1,
    height: 500,
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    height: 40,
    padding: 5,
    marginBottom: 10,
    flex: 1,
    fontSize: 24,
  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 3,
    marginBottom: 40,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 24,
    color: 'white'
  },
  histTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  histText: {
    fontSize: 20,
    paddingTop: 4
  },
  result: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 28,
    marginBottom: 50
  }
});