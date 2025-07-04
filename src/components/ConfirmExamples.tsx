import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Confirm, { ConfirmButton } from './Confirm';
import { useConfirm } from './ConfirmManager';
import Feather from '@expo/vector-icons/Feather';

// Example 1: Simple inline Confirm component
export const SimpleConfirmExample = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
    setShowConfirm(false);
  };

  return (
    <View>
      <Pressable onPress={() => setShowConfirm(true)}>
        <Text>Show Simple Confirm</Text>
      </Pressable>

      <Confirm
        visible={showConfirm}
        title="Are you sure?"
        message="This action cannot be undone."
        confirmText="Yes, proceed"
        onDismiss={() => setShowConfirm(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowConfirm(false),
          },
          {
            text: 'Yes, proceed',
            style: 'default',
            onPress: handleConfirm,
          },
        ]}
      />
    </View>
  );
};

// Example 2: Using the useConfirm hook (requires ConfirmProvider)
export const HookConfirmExample = () => {
  const { showConfirm } = useConfirm();

  const handleShowConfirm = async () => {
    const result = await showConfirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      destructive: true,
      icon: <Feather name="trash-2" size={32} color="#EF4444" />,
      customButtons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
        },
      ],
    });

    if (result === 1) {
      console.log('User confirmed deletion');
      // Handle deletion
    } else {
      console.log('User cancelled');
    }
  };

  return (
    <Pressable onPress={handleShowConfirm}>
      <Text>Show Hook Confirm</Text>
    </Pressable>
  );
};

// Example 3: Destructive action with custom styling
export const DestructiveConfirmExample = () => {
  const [showDestructive, setShowDestructive] = useState(false);

  const handleDestructiveAction = () => {
    console.log('Destructive action executed!');
    setShowDestructive(false);
  };

  return (
    <View>
      <Pressable onPress={() => setShowDestructive(true)}>
        <Text>Show Destructive Confirm</Text>
      </Pressable>

      <Confirm
        visible={showDestructive}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        destructive={true}
        icon={<Feather name="alert-triangle" size={32} color="#EF4444" />}
        onDismiss={() => setShowDestructive(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDestructive(false),
          },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: handleDestructiveAction,
          },
        ]}
      />
    </View>
  );
};

// Example 4: Single button confirm
export const SingleButtonConfirmExample = () => {
  const [showSingle, setShowSingle] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setShowSingle(true)}>
        <Text>Show Single Button Confirm</Text>
      </Pressable>

      <Confirm
        visible={showSingle}
        title="Success!"
        message="Your changes have been saved successfully."
        showCancelButton={false}
        confirmText="OK"
        onDismiss={() => setShowSingle(false)}
      />
    </View>
  );
};

// Example 5: Custom button layout
export const CustomButtonsConfirmExample = () => {
  const [showCustom, setShowCustom] = useState(false);

  const handleSave = () => {
    console.log('Saved');
    setShowCustom(false);
  };

  const handleSaveAndClose = () => {
    console.log('Saved and closed');
    setShowCustom(false);
  };

  return (
    <View>
      <Pressable onPress={() => setShowCustom(true)}>
        <Text>Show Custom Buttons Confirm</Text>
      </Pressable>

      <Confirm
        visible={showCustom}
        title="Save Changes"
        message="Do you want to save your changes?"
        onDismiss={() => setShowCustom(false)}
        customButtons={[
          {
            text: 'Don\'t Save',
            style: 'cancel',
            onPress: () => setShowCustom(false),
          },
          {
            text: 'Save',
            style: 'default',
            onPress: handleSave,
          },
          {
            text: 'Save & Close',
            style: 'default',
            onPress: handleSaveAndClose,
          },
        ]}
      />
    </View>
  );
};

// Example 6: Disabled button state
export const DisabledButtonConfirmExample = () => {
  const [showDisabled, setShowDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowDisabled(false);
    console.log('Async action completed');
  };

  return (
    <View>
      <Pressable onPress={() => setShowDisabled(true)}>
        <Text>Show Disabled Button Confirm</Text>
      </Pressable>

      <Confirm
        visible={showDisabled}
        title="Process Data"
        message="This will process a large amount of data. Continue?"
        onDismiss={() => setShowDisabled(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDisabled(false),
            disabled: isLoading,
          },
          {
            text: isLoading ? 'Processing...' : 'Continue',
            style: 'default',
            onPress: handleAsyncAction,
            disabled: isLoading,
          },
        ]}
      />
    </View>
  );
}; 