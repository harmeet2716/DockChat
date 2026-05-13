import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Phone, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react-native';
import { View as MotiView } from 'moti';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SetupProfile');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <MotiView 
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.logoContainer}
        >
          <MessageSquare color="#10b981" size={40} />
        </MotiView>
        <Text style={styles.title}>DockStack</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? 'Verify your phone number' : 'Enter verification code'}
        </Text>
      </View>

      <MotiView 
        from={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.form}
      >
        {step === 1 ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone color="#64748b" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#475569"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>6-Digit OTP</Text>
            <View style={styles.inputWrapper}>
              <ShieldCheck color="#64748b" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#475569"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          </MotiView>
        )}

        <TouchableOpacity 
          style={styles.button}
          onPress={step === 1 ? handleSendOTP : handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#020617" />
          ) : (
            <>
              <Text style={styles.buttonText}>{step === 1 ? 'Send OTP' : 'Verify'}</Text>
              <ArrowRight color="#020617" size={20} />
            </>
          )}
        </TouchableOpacity>

        {step === 2 && (
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <Text style={styles.backButtonText}>Edit Phone Number</Text>
          </TouchableOpacity>
        )}
      </MotiView>

      <Text style={styles.footer}>
        By continuing, you agree to our Terms and Privacy Policy
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#10b98120',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff05',
    borderWidth: 1,
    borderColor: '#ffffff10',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#10b981',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#020617',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  }
});
