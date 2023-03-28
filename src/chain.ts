import axios from 'axios';

import { RegistryChainInfo, KeplrChainInfo, ChainNetwork, ChainExplorer, KeplrChainExplorer } from './types/chain';
import { prepareKeplrChainInfoTokenAssets } from './utils/currency';
import {
	explorerIsAtomscan,
	explorerIsMintscan,
	fetchDevnetRegistryChainInfo,
	fetchKeplrChainInfo,
	fetchMainnetRegistryChainInfo,
	fetchTestnetRegistryChainInfo,
} from './utils/chain';
import {
	preferredEndpoints,
	keplrChainNamesToRegistryChainNames,
	mainnetChainExplorers,
	testnetChainExplorers,
	devnetChainExplorers,
	MAINNET,
	TESTNET,
	DEVNET,
	chainIdToKeplrChainName,
} from './constants/chain';

/** Fetch the chain info via the chain name and chain network
 * @param chainName string - defined in cosmos chain registry [github.com/cosmos/chain-registry]
 * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
 */
export const getRegistryChainInfo = async (
	chainName: string,
	chainNetwork: ChainNetwork = MAINNET,
): Promise<RegistryChainInfo> => {
	switch (chainNetwork) {
		case MAINNET:
			return await fetchMainnetRegistryChainInfo(chainName);
		case TESTNET:
			return await fetchTestnetRegistryChainInfo(chainName);
		case DEVNET:
			return await fetchDevnetRegistryChainInfo(chainName);
		default:
			throw new Error(`Cannot find chain info for network type ${chainNetwork}`);
	}
};

/** Fetch an active RPC endpoint from the provided chain info
 * @param chainInfo RegistryChainInfo
 */
export const getActiveRpcFromRegistryChainInfo = async (chainInfo: RegistryChainInfo): Promise<string> => {
	const rpcs = chainInfo.apis?.rpc?.map((rpc) => rpc.address) ?? [];
	if (!rpcs.length) throw new Error(`No RPC endpoints found in ${chainInfo.pretty_name} chain info`);
	const chainName = chainInfo.chain_name.replace(/testnet|devnet/i, '');
	const sortedRpcs = rpcs.sort((rpc1: string, rpc2: string) => {
		if ((preferredEndpoints[chainName]?.rpc ?? []).includes(rpc1)) return -1;
		if ((preferredEndpoints[chainName]?.rpc ?? []).includes(rpc2)) return 1;
		return 0;
	});
	for (let rpc of sortedRpcs) {
		try {
			const res = await axios.get(rpc);
			if (res.status === 200) return rpc;
		} catch (error) {
			continue;
		}
	}
	throw new Error(`No RPC endpoints available for ${chainInfo.pretty_name} at the moment`);
};

/** Fetch an active RPC endpoint for the provided chain name and chain network
 * @param chainName string - defined in cosmos chain registry [github.com/cosmos/chain-registry]
 * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
 */
export const getActiveRpcFromChainName = async (
	chainName: string,
	chainNetwork: ChainNetwork = MAINNET,
): Promise<string> => {
	const chainInfo = await getRegistryChainInfo(chainName, chainNetwork);
	const rpcEndpoint = await getActiveRpcFromRegistryChainInfo(chainInfo);
	return rpcEndpoint;
};

/** Fetch the tx explorer info for the provided chain name and network type (and provided explorers)
 * @param chainName string - defined in cosmos chain registry [github.com/cosmos/chain-registry]
 * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
 * @param chainExplorers ChainExplorer[] - defaults to undefined and uses sdk cache
 */
export const getChainExplorer = (
	chainName: string,
	chainNetwork: ChainNetwork,
	chainExplorers?: ChainExplorer[],
): KeplrChainExplorer | undefined => {
	let currentChainExplorers: ChainExplorer[] = chainExplorers;
	if (!currentChainExplorers?.length) {
		const allChainExplorers =
			chainNetwork === MAINNET
				? mainnetChainExplorers
				: chainNetwork === TESTNET
				? testnetChainExplorers
				: chainNetwork === DEVNET
				? devnetChainExplorers
				: {};
		currentChainExplorers = allChainExplorers[chainName];
	}
	if (!currentChainExplorers?.length) return undefined;
	currentChainExplorers = currentChainExplorers.sort((a, b) =>
		explorerIsMintscan(a.url)
			? -1
			: explorerIsMintscan(b.url)
			? 1
			: explorerIsAtomscan(a.url)
			? -1
			: explorerIsAtomscan(b.url)
			? 1
			: 0,
	);
	return {
		name: currentChainExplorers[0].kind,
		txUrl: currentChainExplorers[0].tx_page,
	};
};

/** Fetch the tx explorer info for the provided chain name and network type (via cosmos chain registry)
 * @param chainName string - defined in cosmos chain registry [github.com/cosmos/chain-registry]
 * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
 */
export const getChainExplorerAsync = async (
	chainName: string,
	chainNetwork: ChainNetwork,
): Promise<KeplrChainExplorer | undefined> => {
	try {
		const chain = await getRegistryChainInfo(chainName, chainNetwork);
		if (!chain?.explorers) throw new Error(`No chain info found for ${chainName} ${chainNetwork}`);
		return getChainExplorer(chainName, chainNetwork, chain.explorers);
	} catch (error) {
		return undefined;
	}
};

// const preferredEndpointsContainRest = (
//   chainName: string,
//   rest: string
// ): boolean =>
//   (preferredEndpoints[chainName]?.rest || []).some((preferredRest: string) =>
//     rest.includes(preferredRest)
//   );

// /** Fetch an active REST endpoint from the provided chain info
//  * @param chainInfo RegistryChainInfo
//  */
// export const getActiveRestFromRegistryChainInfo = async (
//   chainInfo: RegistryChainInfo
// ): Promise<string> => {
//   try {
//     let chainRests = chainInfo.apis?.rest?.map((rest) => rest.address);
//     if (!chainRests?.length)
//       throw new Error("No RPC endpoints found in provided chain info");
//     const chainName = chainInfo.chain_name.replace(/testnet/i, "");
//     chainRests = chainRests.sort((rest1: string, rest2: string) => {
//       if (preferredEndpointsContainRest(chainName, rest1)) return -1;
//       if (preferredEndpointsContainRest(chainName, rest2)) return 1;
//       return 0;
//     });
//     for (let rest of chainRests) {
//       try {
//         const res = await axios.get(rest);
//         if (res.status === 200 || res.status === 501) return rest;
//       } catch (error) {
//         if (error.status === 501) return rest;
//         continue;
//       }
//     }
//     throw new Error("No Rest endpoints available at the moment");
//   } catch (error) {
//     throw error;
//   }
// };

// /** Fetch an active REST endpoint for the provided chain name and chain network
//  * @param chainName string - defined in cosmos chain registry [github.com/cosmos/chain-registry]
//  * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
//  */
// export const getActiveRestFromChainName = async (
//   chainName: string,
//   chainNetwork: ChainNetwork = "mainnet"
// ): Promise<string> => {
//   try {
//     const chainInfo = await getRegistryChainInfo(chainName, chainNetwork);
//     const restEndpoint = await getActiveRestFromRegistryChainInfo(chainInfo);
//     return restEndpoint;
//   } catch (error) {
//     throw error;
//   }
// };

/** Fetch the keplr chain info for the provided registry chain info
 * @param chainInfo RegistryChainInfo
 */
export const getKeplrChainInfoFromRegistryChainInfo = async (chainInfo: RegistryChainInfo): Promise<KeplrChainInfo> => {
	const chainName = chainInfo.chain_name?.replace(/testnet|devnet/i, '') ?? '';
	let keplrChainInfo = await fetchKeplrChainInfo(chainName);
	if (!keplrChainInfo?.chainId) throw new Error(`Unable to fetch keplr chain info for ${chainName}`);
	keplrChainInfo = prepareKeplrChainInfoTokenAssets(keplrChainInfo);
	const rpc = await getActiveRpcFromRegistryChainInfo(chainInfo);
	const explorer =
		keplrChainInfo.txExplorer ??
		getChainExplorer(
			chainName,
			chainInfo.network_type ?? /testnet/i.test(chainInfo.chain_name)
				? TESTNET
				: /devnet/i.test(chainInfo.chain_name)
				? DEVNET
				: MAINNET,
			chainInfo.explorers,
		);
	return {
		...keplrChainInfo,
		chainId: chainInfo.chain_id,
		chainName: chainInfo.pretty_name,
		rpc,
		txExplorer: explorer,
	};
};

/** Fetch the keplr chain info for the provided chain name and network type
 * @param chainNameOrId string - defined in cosmos chain registry or keplr chain registry
 * @param chainNetwork 'mainnet' | 'testnet' | 'devnet' - defaults to mainnet
 */
export const getKeplrChainInfo = async (
	chainNameOrId: string,
	chainNetwork: ChainNetwork = MAINNET,
): Promise<KeplrChainInfo> => {
	const keplrChainInfoResult = await fetchKeplrChainInfo(chainNameOrId);
	if (!keplrChainInfoResult?.chainId) throw new Error(`Unable to fetch keplr chain info for ${chainNameOrId}`);
	const keplrChainInfo = prepareKeplrChainInfoTokenAssets(keplrChainInfoResult);
	const registryChainName =
		keplrChainNamesToRegistryChainNames[chainNameOrId] ??
		(chainIdToKeplrChainName[chainNameOrId]
			? keplrChainNamesToRegistryChainNames[chainIdToKeplrChainName[chainNameOrId]]
			: chainNameOrId);
	const registryChainInfo = await getRegistryChainInfo(registryChainName, chainNetwork);
	if (!registryChainInfo) {
		if (chainNetwork === MAINNET) return keplrChainInfo;
		throw new Error(`Unable to fetch keplr chain info for ${chainNameOrId} ${chainNetwork}`);
	}
	const rpc = await getActiveRpcFromRegistryChainInfo(registryChainInfo);
	const explorer =
		keplrChainInfo.txExplorer ?? getChainExplorer(chainNameOrId, chainNetwork, registryChainInfo.explorers);
	return {
		...keplrChainInfo,
		chainId: registryChainInfo.chain_id,
		chainName: registryChainInfo.pretty_name,
		rpc: rpc,
		txExplorer: explorer,
	};
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
