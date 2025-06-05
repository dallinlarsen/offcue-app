'use client';
import React from 'react';
import { View, Switch as RNSwitch } from 'react-native';
import { createSwitch } from '@gluestack-ui/switch';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { Icon, CheckIcon, CloseIcon } from '../icon';

const UISwitch = createSwitch({
  Root: withStyleContext(RNSwitch),
});

const switchStyle = tva({
  base: 'data-[focus=true]:outline-0 data-[focus=true]:ring-2 data-[focus=true]:ring-indicator-primary web:cursor-pointer disabled:cursor-not-allowed data-[disabled=true]:opacity-40 data-[invalid=true]:border-error-700 data-[invalid=true]:rounded-xl data-[invalid=true]:border-2',

  variants: {
    size: {
      sm: 'scale-75',
      md: '',
      lg: 'scale-125',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof UISwitch> &
  VariantProps<typeof switchStyle>;
const Switch = React.forwardRef<
  React.ComponentRef<typeof UISwitch>,
  ISwitchProps
>(function Switch({ className, size = 'md', ...props }, ref) {
  const { value } = props as { value?: boolean };
  return (
    <View className="relative justify-center">
      <UISwitch
        ref={ref}
        {...props}
        className={switchStyle({ size, class: className })}
      />
      <View
        pointerEvents="none"
        className="absolute inset-0 flex items-center justify-center"
      >
        {value ? (
          <Icon as={CheckIcon} size="xs" className="text-typography-50" />
        ) : (
          <Icon as={CloseIcon} size="xs" className="text-typography-50" />
        )}
      </View>
    </View>
  );
});

Switch.displayName = 'Switch';
export { Switch };
