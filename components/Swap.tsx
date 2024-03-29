import { PublicKey } from "@solana/web3.js";
import { useSwapDriver } from "@strata-foundation/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useErrorHandler, useSwap, useTokenBonding } from "@strata-foundation/react";
import { Notification } from "@strata-foundation/react";
import { SwapForm } from "./SwapForm";

const identity = () => {};
export const Swap = (min: number, { tokenBondingKey }: { tokenBondingKey: PublicKey }) => {
  const { loading, error, execute } = useSwap();
  const { handleErrors } = useErrorHandler();
  handleErrors(error);
  const { info: tokenBonding } = useTokenBonding(tokenBondingKey);
  const [tradingMints, setTradingMints] = useState<{
    base?: PublicKey;
    target?: PublicKey;
  }>({
    base: tokenBonding?.baseMint,
    target: tokenBonding?.targetMint,
  });

  React.useEffect(() => {
    if ((!tradingMints.base || !tradingMints.target) && tokenBonding) {
      setTradingMints({
        base: tokenBonding.baseMint,
        target: tokenBonding.targetMint,
      });
    }
  }, [tokenBonding, tradingMints]);
// @ts-ignore
  const { loading: driverLoading, ...swapProps } = useSwapDriver({
    tradingMints,
    onTradingMintsChange: setTradingMints,
    swap: (args) =>
      execute(args).then(({ targetAmount }) => {
        toast.custom((t) => (
          <Notification
            show={t.visible}
            type="success"
            heading="Transaction Successful"
            message={`Succesfully purchased ${Number(targetAmount).toFixed(
              9
            )} ${args.ticker}!`}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ));
      }).catch(console.error),
    onConnectWallet: identity,
    tokenBondingKey: tokenBondingKey,
  });

  return (
      // @ts-ignore
    <SwapForm min={min * 1.2 * 1.01} isLoading={driverLoading} isSubmitting={loading} {...swapProps} />
  );
};
