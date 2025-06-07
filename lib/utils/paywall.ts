import RevenueCatUI from "react-native-purchases-ui";
import Purchases from "react-native-purchases";

export async function presentPaywallIfNeeded(identifier: string) {
//   const offerings = await Purchases.getOfferings();

  // If you need to present a specific offering:
  await RevenueCatUI.presentPaywallIfNeeded({
    // offering: offerings.all[identifier],
    requiredEntitlementIdentifier: identifier,
  });
}
