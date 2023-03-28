import axios from 'axios';

import {
	chainIdToKeplrChainName,
	localDevnetRegistry,
	localTestnetRegistry,
	registryChainNamesToKeplrChainNames,
} from '../constants/chain';
import { KeplrChainInfo, RegistryChainInfo } from '../types/chain';

export const fetchMainnetRegistryChainInfo = async (chainName: string): Promise<RegistryChainInfo> => {
	const url = `https://proxy.atomscan.com/directory/${chainName}/chain.json`;
	const response = await axios.get(url);
	return response.data as RegistryChainInfo;
};

export const fetchTestnetRegistryChainInfo = async (chainName: string): Promise<RegistryChainInfo> => {
	try {
		const url = `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/${chainName}testnet/chain.json`;
		const response = await axios.get(url);
		return response.data as RegistryChainInfo;
	} catch (error) {
		const chainInfo = localTestnetRegistry[chainName];
		if (!chainInfo) throw new Error('Cannot find testnet chain info for ' + chainName);
		return chainInfo as RegistryChainInfo;
	}
};

export const fetchDevnetRegistryChainInfo = async (chainName: string): Promise<RegistryChainInfo> => {
	try {
		const url = `https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/${chainName}devnet/chain.json`;
		const response = await axios.get(url);
		return response.data as RegistryChainInfo;
	} catch (error) {
		const chainInfo = localDevnetRegistry[chainName];
		if (!chainInfo) throw new Error('Cannot find devnet chain info for ' + chainName);
		return chainInfo as RegistryChainInfo;
	}
};

export const explorerIsMintscan = (explorer: string) => /mintscan./i.test(explorer);

export const explorerIsAtomscan = (explorer: string) => /atomscan./i.test(explorer);

export const fetchKeplrChainInfo = async (chainName: string) => {
	const keplrChainName =
		registryChainNamesToKeplrChainNames[chainName] ?? chainIdToKeplrChainName[chainName] ?? chainName;
	const url = `https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/cosmos/${keplrChainName}.json`;
	const response = await axios.get(url);
	return response.data as KeplrChainInfo;
};
