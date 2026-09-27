import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <TextWrapper />
      </ThemedView>
    </>
  );
}

function TextWrapper() {
  return (
    <>
      <ThemedText type="title">Esta tela não existe.</ThemedText>
      <Link href="/" style={styles.link}>
        <ThemedText type="link">Voltar para o início</ThemedText>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
