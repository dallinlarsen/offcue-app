'use client';
import React, { useEffect, useState } from 'react';
import { View, Switch as RNSwitch } from 'react-native';
import { createSwitch } from '@gluestack-ui/switch';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { Icon, CheckIcon, CloseIcon } from '../icon';
import { Box } from '../box';

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
  const [iconPlacement, setIconPlacement] = useState('');

  useEffect(() => {
    switch (size) {
      case "sm":
        setIconPlacement(value ? "right-3" : "left-3");
        break;
      default:
        setIconPlacement(value ? "right-2" : "left-2");
        break;
    }
  }, [value]);

  return (
    <Box className="relative justify-center">
      <UISwitch
        ref={ref}
        {...props}
        className={switchStyle({ size, class: className })}
      />
      <Box
        pointerEvents="none"
        className={`absolute flex items-center justify-center ${iconPlacement}`}
      >
        {value ? (
          <Icon as={CheckIcon} size={size} className="text-gray-950" />
        ) : (
          <Icon as={CloseIcon} size={size} className="text-gray-500" />
        )}
      </Box>
    </Box>
  );
});

Switch.displayName = 'Switch';
export { Switch };
