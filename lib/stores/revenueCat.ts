import { atom, map } from "nanostores";
import { CustomerInfo } from "react-native-purchases";

export const $hasUnlimited = atom(false);
export const $entitlementsLoading = atom(false);
export const $customerInfo = map<CustomerInfo>({} as CustomerInfo);

$customerInfo.listen((val) => {
  $hasUnlimited.set(!!val.entitlements.active["Unlimited"]);
});
