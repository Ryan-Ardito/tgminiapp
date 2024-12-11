import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { Counter } from "./components/Counter";
import { Jetton } from "./components/Jetton";
import { TransferTon } from "./components/TransferTon";
import styled from "styled-components";
import { Button, FlexBoxCol, FlexBoxRow } from "./components/styled/styled";
import { useTonConnect } from "./hooks/useTonConnect";
import { CHAIN } from "@tonconnect/protocol";
import "@twa-dev/sdk";
import { TipDev } from "./components/TipDev";
import BabylonCanvas from "./components/BabylonCanvas";

const StyledApp = styled.div`
  background-color: #e8e8e8;
  color: black;

  @media (prefers-color-scheme: dark) {
    background-color: #222;
    color: white;
  }
  min-height: 100vh;
`;

const AppContainer = styled.div`
  margin: 0 auto;
`;

function App() {
  const { network } = useTonConnect();

  return (
    <StyledApp>
      <AppContainer>
        {/* <FlexBoxCol> */}
        <FlexBoxRow
          style={{
            justifyContent: "right",
            position: "absolute",
            top: "20px",
            right: "10px",
          }}
        >
          <Button>
            {network
              ? network === CHAIN.MAINNET
                ? "mainnet"
                : "testnet"
              : "N/A"}
          </Button>
          <TonConnectButton />
        </FlexBoxRow>
        {/* <TipDev /> */}
        <BabylonCanvas />
        {/* </FlexBoxCol> */}
      </AppContainer>
    </StyledApp>
  );
}

export default App;
