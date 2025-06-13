import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { UNLIMITED_ENTITLEMENT_ID } from "./revenue-cat.constants";
import { $hasUnlimited } from "./revenue-cat.store";

export async function presentUnlimitedPaywall() {
  const paywallResult: PAYWALL_RESULT =
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: UNLIMITED_ENTITLEMENT_ID,
    });

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      $hasUnlimited.set(false);
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      $hasUnlimited.set(true);
      return true;
    default:
      $hasUnlimited.set(false);
      return false;
  }
}
