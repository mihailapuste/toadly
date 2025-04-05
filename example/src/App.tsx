import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Toadly from 'react-native-toadly';
import { config } from '../config';
import axios from 'axios';

const { token, repoOwner, repoName } = config.github;
Toadly.setup(token, repoOwner, repoName);

// Enable automatic issue submission for JS errors
Toadly.enableAutomaticIssueSubmission(true);

// Enable network logging
Toadly.startNetworkMonitoring();

export default function App() {
  const [apiResponse, setApiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
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

  const makeSuccessfulApiCall = async () => {
    setIsLoading(true);
    setApiResponse('');
    setApiError('');
    
    try {
      console.log('Making successful API call');
      Toadly.log('User initiated successful API call');
      
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      console.log('API response:', response.data);
      
      // Log the successful API call
      Toadly.log(`API call successful: ${JSON.stringify(response.data)}`);
      
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('API call failed:', error);
      
      // Log the error to Toadly
      if (error instanceof Error) {
        Toadly.logError(error, false);
        setApiError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const makeFailedApiCall = async () => {
    setIsLoading(true);
    setApiResponse('');
    setApiError('');
    
    try {
      console.log('Making failed API call');
      Toadly.log('User initiated failed API call');
      
      // This URL doesn't exist, so it will fail
      const response = await axios.get('https://jsonplaceholder.typicode.com/nonexistent');
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('API call failed (as expected):', error);
      
      // Log the error to Toadly
      if (error instanceof Error) {
        Toadly.logError(error, false);
        setApiError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
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

          <View style={styles.apiSection}>
            <Text style={styles.sectionTitle}>API Testing</Text>
            
            <TouchableOpacity
              style={styles.successButton}
              onPress={makeSuccessfulApiCall}
            >
              <Text style={styles.successButtonText}>Make Successful API Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.failButton}
              onPress={makeFailedApiCall}
            >
              <Text style={styles.failButtonText}>Make Failed API Call</Text>
            </TouchableOpacity>
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4682B4" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
            
            {apiResponse !== '' && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>API Response:</Text>
                <Text style={styles.responseText}>{apiResponse}</Text>
              </View>
            )}
            
            {apiError !== '' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>API Error:</Text>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}
          </View>
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
  apiSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  failButton: {
    backgroundColor: '#B22222',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  failButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4682B4',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ADD8E6',
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4682B4',
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#B22222',
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
