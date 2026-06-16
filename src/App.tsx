import { Authenticator, useAuthenticator, View, Heading, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import FileUpload from './components/FileUpload';

const formFields = {
  signUp: {
    name: { order: 1, label: 'Full Name', placeholder: 'Enter your full name' },
    email: { order: 2 },
    password: { order: 3 },
    confirm_password: { order: 4 },
  },
};

function AppContent() {
  const { signOut, user } = useAuthenticator();
  const email = user?.signInDetails?.loginId ?? '';

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">PDF Uploader</h1>
        <div className="user-info">
          <span className="user-email">{email}</span>
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <main className="app-main">
        <FileUpload />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator
      loginMechanisms={['email']}
      signUpAttributes={['name']}
      formFields={formFields}
      components={{
        Header() {
          return (
            <View textAlign="center" padding="large">
              <Heading level={3}>PDF Uploader</Heading>
              <Text>Sign in or create an account to upload your documents.</Text>
            </View>
          );
        },
      }}
    >
      <AppContent />
    </Authenticator>
  );
}
