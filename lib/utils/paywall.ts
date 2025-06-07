import RevenueCatUI from "react-native-purchases-ui";

export async function presentPaywallIfNeeded(identifier: string) {
  await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: identifier,
  });
}
