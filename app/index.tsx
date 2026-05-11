import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect immediately to the login page
  return <Redirect href="/auth/login" />;
}
