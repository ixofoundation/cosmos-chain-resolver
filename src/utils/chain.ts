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

/**
 * Update the chain id - keplr chain name constants
 * Run script frequently to stay up to date
 */
// const updateChainIdToKeplrChainName = async () => {
// 	const keplrRegistryChains = [
// 		'FUND-MainNet',
// 		'LumenX',
// 		'agoric',
// 		'akashnet',
// 		'arkh',
// 		'axelar-dojo',
// 		'bitcanna',
// 		'bluzelle',
// 		'bostrom',
// 		'canto_7700',
// 		'carbon',
// 		'cheqd-mainnet',
// 		'chihuahua',
// 		'colosseum',
// 		'columbus',
// 		'comdex',
// 		'core',
// 		'cosmoshub',
// 		'crescent',
// 		'crypto-org-chain-mainnet',
// 		'desmos-mainnet',
// 		'eightball',
// 		'emoney',
// 		'evmos_9001',
// 		'gravity-bridge',
// 		'icplaza_9000',
// 		'injective',
// 		'iov-mainnet-ibc',
// 		'irishub',
// 		'ixo',
// 		'jackal',
// 		'juno',
// 		'kava_2222',
// 		'likecoin-mainnet',
// 		'lum-network',
// 		'mantle',
// 		'mars',
// 		'medasdigital',
// 		'meme',
// 		'migaloo',
// 		'nyx',
// 		'odin-mainnet-freya',
// 		'omniflixhub',
// 		'osmosis',
// 		'panacea',
// 		'phoenix',
// 		'pio-mainnet',
// 		'pio-testnet',
// 		'planq_7070',
// 		'quasar',
// 		'quicksilver',
// 		'regen',
// 		'secret',
// 		'sentinelhub',
// 		'shentu-2.2',
// 		'sifchain',
// 		'sommelier',
// 		'stafihub',
// 		'stargaze',
// 		'stride',
// 		'tgrade-mainnet',
// 		'umee',
// 	];

// 	const result = {};

// 	await Promise.allSettled(
// 		keplrRegistryChains.map(async (chain) => {
// 			try {
// 				const res = await axios.get(
// 					`https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/cosmos/${chain}.json`,
// 				);
// 				result[res.data.chainId] = chain;
// 			} catch (error) {
// 				console.error(chain, error);
// 			}
// 		}),
// 	);

// 	return result;
// };
