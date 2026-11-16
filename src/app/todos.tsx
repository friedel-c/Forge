import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type Todo, useTodos } from '@/hooks/use-todos';

export default function TodoScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos();
  const [text, setText] = useState('');

  const remaining = todos.filter((t) => !t.done).length;

  const submit = () => {
    addTodo(text);
    setText('');
  };

  // Oberer Abstand (Statusleiste) wird bereits von der Kopfleiste im Layout übernommen.
  const paddingStyle = { paddingTop: Spacing.two, paddingBottom: insets.bottom + Spacing.four };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, paddingStyle]}>
        <ThemedText type="subtitle">Todos</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {todos.length === 0
            ? 'Noch nichts hier – füge unten dein erstes Todo hinzu.'
            : `${remaining} von ${todos.length} offen`}
        </ThemedText>

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Was ist zu tun?"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            submitBehavior="submit"
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundElement },
            ]}
          />
          <Pressable
            onPress={submit}
            disabled={!text.trim()}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.addButton,
              (pressed || !text.trim()) && styles.dimmed,
            ]}>
            <ThemedText type="smallBold" style={styles.addButtonText}>
              Hinzufügen
            </ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TodoRow todo={item} onToggle={toggleTodo} onRemove={removeTodo} />
          )}
        />
      </View>
    </ThemedView>
  );
}

function TodoRow({
  todo,
  onToggle,
  onRemove,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <Pressable
        onPress={() => onToggle(todo.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
        style={styles.rowMain}>
        <View
          style={[
            styles.checkbox,
            { borderColor: todo.done ? Accent : theme.textSecondary },
            todo.done && { backgroundColor: Accent },
          ]}>
          {todo.done && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </View>
        <ThemedText
          style={[styles.rowTitle, todo.done && styles.doneText]}
          themeColor={todo.done ? 'textSecondary' : 'text'}>
          {todo.title}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onRemove(todo.id)}
        accessibilityRole="button"
        accessibilityLabel={`${todo.title} löschen`}
        hitSlop={8}
        style={({ pressed }) => pressed && styles.dimmed}>
        <ThemedText type="small" themeColor="textSecondary">
          ✕
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  addButton: {
    backgroundColor: Accent,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
  },
  dimmed: {
    opacity: 0.5,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: 700,
  },
  rowTitle: {
    flex: 1,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
});
