import { KeplrChainInfo } from '../types/chain';
import { TokenAsset } from '../types/currency';

const convertCurrencyToTokenAsset = (
	currency: TokenAsset,
	stakeCurrency: TokenAsset,
	feeCurrencies: TokenAsset[] = [],
	coinImageUrl?: string,
): TokenAsset => {
	const denomLowerCased = currency.coinMinimalDenom.toLowerCase() ?? '';
	const isStakeCurrency = stakeCurrency.coinMinimalDenom.toLowerCase() === denomLowerCased;
	const isFeeCurrency = !!feeCurrencies?.find(
		(feeCur: TokenAsset) => feeCur.coinMinimalDenom.toLowerCase() === denomLowerCased,
	);
	const result = { ...currency, isStakeCurrency, isFeeCurrency };
	if (isStakeCurrency && isFeeCurrency && coinImageUrl?.length) result.coinImageUrl = coinImageUrl;
	return result;
};

export const prepareKeplrChainInfoTokenAssets = (chainInfo: KeplrChainInfo): KeplrChainInfo => ({
	...chainInfo,
	currencies:
		chainInfo.currencies?.map((cur) =>
			convertCurrencyToTokenAsset(cur, chainInfo.stakeCurrency, chainInfo.feeCurrencies, chainInfo.chainSymbolImageUrl),
		) ?? [],
	stakeCurrency: convertCurrencyToTokenAsset(
		chainInfo.stakeCurrency,
		chainInfo.stakeCurrency,
		chainInfo.feeCurrencies,
		chainInfo.chainSymbolImageUrl,
	),
	feeCurrencies:
		chainInfo.feeCurrencies?.map((cur) =>
			convertCurrencyToTokenAsset(cur, chainInfo.stakeCurrency, chainInfo.feeCurrencies, chainInfo.chainSymbolImageUrl),
		) ?? [],
});
