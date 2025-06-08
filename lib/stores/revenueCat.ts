import { atom, map, onMount, task } from "nanostores";
import Purchases, { CustomerInfo } from "react-native-purchases";

export const $hasUnlimited = atom(true);
export const $entitlementsLoading = atom(false);
export const $customerInfo = map<CustomerInfo>({} as CustomerInfo);

onMount($customerInfo, () => {
  task(async () => {
    $customerInfo.set(await Purchases.getCustomerInfo());
  });
});

$customerInfo.listen((val) => {
  $hasUnlimited.set(!!val.entitlements.active["Unlimited"]);
  console.log(val.entitlements.active);
});
