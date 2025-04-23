export const openDatabaseSync = jest.fn(() => ({
    // mimic the minimal interface your code/tests expect
    transaction: (cb: (tx: { executeSql: Function }) => void) => {
      const dummyTx = {
        executeSql: (_sql: string, _params: any[], success?: Function) => {
          // you can invoke `success` with fake rows if your tests care
          if (success) success(dummyTx, { rows: { _array: [] } });
        }
      };
      cb(dummyTx);
    },
  }));