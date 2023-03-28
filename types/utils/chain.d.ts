import { KeplrChainInfo, RegistryChainInfo } from '../types/chain';
export declare const fetchMainnetRegistryChainInfo: (chainName: string) => Promise<RegistryChainInfo>;
export declare const fetchTestnetRegistryChainInfo: (chainName: string) => Promise<RegistryChainInfo>;
export declare const fetchDevnetRegistryChainInfo: (chainName: string) => Promise<RegistryChainInfo>;
export declare const explorerIsMintscan: (explorer: string) => boolean;
export declare const explorerIsAtomscan: (explorer: string) => boolean;
export declare const fetchKeplrChainInfo: (chainName: string) => Promise<KeplrChainInfo>;
