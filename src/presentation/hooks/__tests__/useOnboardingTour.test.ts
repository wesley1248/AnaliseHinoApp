import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOnboardingTour } from '../useOnboardingTour';
import { IOnboardingStorage } from '@/data/preferences/onboardingStorage';

describe('useOnboardingTour hook', () => {
  let mockStorage: jest.Mocked<IOnboardingStorage>;

  beforeEach(() => {
    mockStorage = {
      getLastSeenVersion: jest.fn(),
      saveLastSeenVersion: jest.fn(),
      reset: jest.fn(),
    };
  });

  it('deve disparar convite na primeira instalação (sem versão anterior salva)', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.showPrompt).toBe(true);
    expect(result.current.isUpdate).toBe(false);
  });

  it('deve disparar convite de atualização quando a versão salva for anterior', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue('1.0.3');

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.showPrompt).toBe(true);
    expect(result.current.isUpdate).toBe(true);
  });

  it('não deve exibir convite se a versão atual já foi visualizada', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue('1.0.4');

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.showPrompt).toBe(false);
  });

  it('deve salvar a versão e fechar convite ao dispensar (dismissPrompt)', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.showPrompt).toBe(true);
    });

    await act(async () => {
      await result.current.dismissPrompt();
    });

    expect(result.current.showPrompt).toBe(false);
    expect(mockStorage.saveLastSeenVersion).toHaveBeenCalledWith('1.0.4');
  });

  it('deve iniciar o tour, avançar passos e finalizar gravando a versão', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.showPrompt).toBe(true);
    });

    // Usuário clica em iniciar tour
    act(() => {
      result.current.startTour();
    });

    expect(result.current.showPrompt).toBe(false);
    expect(result.current.isTourActive).toBe(true);
    expect(result.current.currentStep).toBe(0);

    // Avança passo
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);

    // Volta passo
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(0);

    // Conclui o tour
    await act(async () => {
      await result.current.finishTour();
    });

    expect(result.current.isTourActive).toBe(false);
    expect(mockStorage.saveLastSeenVersion).toHaveBeenCalledWith('1.0.4');
  });

  it('deve permitir reabrir o tour manualmente através de reopenTour()', async () => {
    mockStorage.getLastSeenVersion.mockResolvedValue('1.0.4');

    const { result } = renderHook(() =>
      useOnboardingTour({
        storage: mockStorage,
        currentVersion: '1.0.4',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isTourActive).toBe(false);

    act(() => {
      result.current.reopenTour();
    });

    expect(result.current.isTourActive).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });
});
