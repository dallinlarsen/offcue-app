import { atom, map } from "nanostores";
import { CustomerInfo } from "react-native-purchases";
import { UNLIMITED_ENTITLEMENT_NAME } from "./stores.constants";

export const $hasUnlimited = atom(false);
export const $entitlementsLoading = atom(false);
export const $customerInfo = map<CustomerInfo>({} as CustomerInfo);

$customerInfo.listen((val) => {
  $hasUnlimited.set(!!val.entitlements.active[UNLIMITED_ENTITLEMENT_NAME]);
});
