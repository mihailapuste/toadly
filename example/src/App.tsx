import React, { useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Toadly from 'react-native-toadly';
import { config } from '../config';

const { token, repoOwner, repoName } = config.github;
Toadly.setup(token, repoOwner, repoName);

// Enable automatic issue submission for JS errors
Toadly.enableAutomaticIssueSubmission(true);

export default function App() {
  
  useEffect(() => {
    console.log('App initialized');
    console.info('Environment loaded successfully');
    
    Toadly.log('App component mounted');
    
    const logExamples = () => {
      console.log('User interaction occurred');
      console.info('Data fetched successfully');
      
      Toadly.log('Custom business logic executed');
    };
    
    logExamples();
    
    return () => {
      Toadly.log('App component will unmount');
    };
  }, []);

  const handleReportBug = () => {
    console.log('User initiated bug report');
    Toadly.log('Bug report requested by user');
    Toadly.show();
  };
  
  const handleTriggerError = () => {
    try {
      // Simulate an error
      console.log('Attempting to trigger an error...');
      Toadly.log('User triggered a sample error');
      
      // This will cause an error - using type assertion to silence TypeScript error
      // @ts-ignore - This is intentionally causing an error for demonstration
      const obj = null;
      (obj as any).nonExistentMethod();
    } catch (error) {
      // Manually log the caught error
      console.error('Caught error:', error);
      
      // Log the error to Toadly
      if (error instanceof Error) {
        Toadly.logError(error, false);
      }
    }
  };
  
  const handleTriggerFatalError = () => {
    console.log('Triggering a fatal error...');
    Toadly.log('User triggered a fatal error');
    
    // This will cause an uncaught error that will be automatically reported
    setTimeout(() => {
      // @ts-ignore - This is intentionally causing an error for demonstration
      const array = undefined;
      (array as any).push('This will crash');
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.calculatorContainer}>
          <Text style={styles.title}>Toadly</Text>

          <Text style={styles.description}>
            This example demonstrates the Toadly bug reporting tool with automatic log collection.
            When you tap the button below, the last 50 logs from both JavaScript and native code
            will be included in your bug report.
          </Text>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportBug}
          >
            <Text style={styles.reportButtonText}>Report a Bug</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => {
              Toadly.log('User tapped the "Add Log" button');
              console.log('Log button pressed at ' + new Date().toISOString());
            }}
          >
            <Text style={styles.logButtonText}>Add Log Entry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.errorButton}
            onPress={handleTriggerError}
          >
            <Text style={styles.errorButtonText}>Trigger Caught Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.fatalButton}
            onPress={handleTriggerFatalError}
          >
            <Text style={styles.fatalButtonText}>Trigger Fatal Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              console.log('Clearing logs');
              Toadly.clearLogs();
              console.log('Logs cleared at ' + new Date().toISOString());
            }}
          >
            <Text style={styles.clearButtonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  calculatorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logButton: {
    backgroundColor: '#4682B4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorButton: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fatalButton: {
    backgroundColor: '#DC143C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  fatalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#708090',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
