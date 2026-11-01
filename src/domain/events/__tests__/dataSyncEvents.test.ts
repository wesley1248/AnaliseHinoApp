import { DataSyncNotifier } from '../dataSyncEvents';

describe('DataSyncNotifier', () => {
  let notifier: DataSyncNotifier;

  beforeEach(() => {
    notifier = new DataSyncNotifier();
  });

  it('deve registrar listeners e notificá-los na invocação de notify', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsub1 = notifier.subscribe(listener1);
    const unsub2 = notifier.subscribe(listener2);

    expect(notifier.getListenerCount()).toBe(2);

    notifier.notify();
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);

    unsub1();
    notifier.notify();
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2);

    unsub2();
    expect(notifier.getListenerCount()).toBe(0);
  });

  it('deve continuar notificando outros listeners se um deles lançar erro', () => {
    const faultyListener = jest.fn().mockImplementation(() => {
      throw new Error('Falha no listener');
    });
    const goodListener = jest.fn();

    notifier.subscribe(faultyListener);
    notifier.subscribe(goodListener);

    expect(() => notifier.notify()).not.toThrow();
    expect(faultyListener).toHaveBeenCalledTimes(1);
    expect(goodListener).toHaveBeenCalledTimes(1);
  });
});
