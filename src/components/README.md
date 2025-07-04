# Confirm Component

A customizable modal dialog component to replace `Alert.alert()` calls throughout the app. Provides consistent styling with your app's design system and supports various customization options.

## Features

- ✅ Consistent styling with your app's design system
- ✅ Smooth animations with fade and scale effects
- ✅ Support for icons (using Feather icons)
- ✅ Multiple button styles (default, cancel, destructive)
- ✅ Customizable button layouts
- ✅ Disabled button states
- ✅ Safe area handling
- ✅ TypeScript support
- ✅ NativeWind styling

## Basic Usage

### 1. Simple Inline Component

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Confirm from './Confirm';

const MyComponent = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
    setShowConfirm(false);
  };

  return (
    <View>
      <Pressable onPress={() => setShowConfirm(true)}>
        <Text>Show Confirm</Text>
      </Pressable>

      <Confirm
        visible={showConfirm}
        title="Are you sure?"
        message="This action cannot be undone."
        onDismiss={() => setShowConfirm(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowConfirm(false),
          },
          {
            text: 'Confirm',
            style: 'default',
            onPress: handleConfirm,
          },
        ]}
      />
    </View>
  );
};
```

### 2. Using the Hook (Recommended for global usage)

First, wrap your app with the `ConfirmProvider`:

```tsx
// In your root component (e.g., App.tsx)
import { ConfirmProvider } from './components/ConfirmManager';

export default function App() {
  return (
    <ConfirmProvider>
      {/* Your app components */}
    </ConfirmProvider>
  );
}
```

Then use the hook in any component:

```tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useConfirm } from './ConfirmManager';

const MyComponent = () => {
  const { showConfirm } = useConfirm();

  const handleShowConfirm = async () => {
    const result = await showConfirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      destructive: true,
      icon: <Feather name="trash-2" size={32} color="#EF4444" />,
      customButtons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ],
    });

    if (result === 1) {
      console.log('User confirmed deletion');
      // Handle deletion
    }
  };

  return (
    <Pressable onPress={handleShowConfirm}>
      <Text>Delete Item</Text>
    </Pressable>
  );
};
```

## API Reference

### Confirm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | - | Controls modal visibility |
| `title` | `string` | - | Modal title |
| `message` | `string` | - | Modal message (optional) |
| `buttons` | `ConfirmButton[]` | - | Custom button configuration |
| `onDismiss` | `() => void` | - | Called when modal is dismissed |
| `showCancelButton` | `boolean` | `true` | Whether to show cancel button |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `confirmText` | `string` | `'OK'` | Confirm button text |
| `destructive` | `boolean` | `false` | Whether this is a destructive action |
| `icon` | `React.ReactNode` | - | Icon to display (React component) |
| `customButtons` | `ConfirmButton[]` | - | Override default buttons |

### ConfirmButton Interface

```tsx
interface ConfirmButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  disabled?: boolean;
}
```

### useConfirm Hook

```tsx
const { showConfirm } = useConfirm();

// Returns a Promise<number> where:
// -1 = cancelled/dismissed
// 0, 1, 2... = button index (0-based)
const result = await showConfirm(props);
```

## Examples

### Destructive Action

```tsx
import Feather from '@expo/vector-icons/Feather';

<Confirm
  visible={showDelete}
  title="Delete Account"
  message="This will permanently delete your account and all associated data."
  destructive={true}
  icon={<Feather name="alert-triangle" size={32} color="#EF4444" />}
  onDismiss={() => setShowDelete(false)}
  customButtons={[
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete Account', style: 'destructive' },
  ]}
/>
```

### Single Button (Info/Alert)

```tsx
<Confirm
  visible={showSuccess}
  title="Success!"
  message="Your changes have been saved successfully."
  showCancelButton={false}
  confirmText="OK"
  onDismiss={() => setShowSuccess(false)}
/>
```

### Multiple Custom Buttons

```tsx
<Confirm
  visible={showSave}
  title="Save Changes"
  message="Do you want to save your changes?"
  onDismiss={() => setShowSave(false)}
  customButtons={[
    { text: "Don't Save", style: 'cancel' },
    { text: 'Save', style: 'default' },
    { text: 'Save & Close', style: 'default' },
  ]}
/>
```

### Loading State

```tsx
<Confirm
  visible={showProcess}
  title="Process Data"
  message="This will process a large amount of data. Continue?"
  onDismiss={() => setShowProcess(false)}
  customButtons={[
    { 
      text: 'Cancel', 
      style: 'cancel',
      disabled: isLoading 
    },
    { 
      text: isLoading ? 'Processing...' : 'Continue', 
      style: 'default',
      disabled: isLoading 
    },
  ]}
/>
```

## Migration from Alert.alert

### Before (Alert.alert)

```tsx
Alert.alert(
  'Delete Note?',
  null,
  [
    { text: 'Cancel', style: 'cancel' },
    { 
      text: 'Delete', 
      onPress: () => deleteNote(id) 
    },
  ]
);
```

### After (Confirm Component)

```tsx
const [showDelete, setShowDelete] = useState(false);

const handleDelete = () => {
  deleteNote(id);
  setShowDelete(false);
};

// In JSX
<Confirm
  visible={showDelete}
  title="Delete Note?"
        destructive={true}
      icon={<Feather name="trash-2" size={32} color="#EF4444" />}
      onDismiss={() => setShowDelete(false)}
      customButtons={[
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]}
    />
```

## Styling

The component uses NativeWind classes and follows your app's color scheme:

- **Primary background**: `bg-primary` (from Colors.dark.primary)
- **Secondary text**: `text-secondary` (from Colors.dark.secondary)
- **Accent color**: `bg-accent` (from Colors.dark.accent)
- **Destructive**: `bg-red-500`
- **Cancel**: `bg-gray-500`

You can customize the styling by modifying the `getButtonStyle` and `getButtonTextStyle` functions in the component. 