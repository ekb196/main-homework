import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {
  buyCurrencyRequest,
  sellCurrencyRequest
} from "../../actions/currency";
import { fetchWalletRequest } from "../../actions/wallet";
import {
  getCurrentBtcPurchase,
  getCurrentBtcSell,
  getCurrentEthPurchase,
  getCurrentEthSell,
  getSelected
} from "../../reducers/currency";
import {
  getWalletError,
  getWalletBtc,
  getWalletEth,
  getWalletUsd
} from "../../reducers/wallet";

//styles
const Container = styled.div`
  padding-top: 50px;
`;

const InputWrapper = styled.div`
  background-color: #f2f2f2;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  margin: 5px 0;
  width: 218px;
`;

const Input = styled.input`
  background-color: transparent;
  border: none;
  text-align: right;
  width: 100%;
  padding: 5px 0 3px;
  padding-right: 40px;
  box-sizing: border-box;
`;

const Currency = styled.span`
  position: absolute;
  right: 8px;
  width: 38px;
  text-align: right;
  color: #adadad;
  top: 5px;
`;

const Button = styled.button`
  width: 100px;
  margin-left: 20px;
  border: 0;
  color: #fff;
  padding: 5px 0 3px;
`;

const ButtonSell = Button.extend`
  background-color: #cb5f58;
  &:hover {
    background-color: #ba564f;
  }
`;
const ButtonPurchase = Button.extend`
  background-color: #69b3dc;
  &:hover {
    background-color: #63acd5;
  }
`;
const WalletWrapper = styled.div`
  margin-bottom: 50px;
`;
const WalletCurrency = styled.div`
  margin-bottom: 10px;
  display: flex;
  font-size: 1.2em;
  align-items: center;
`;
const CurrencyQuantity = styled.div`
  background-color: #404243;
  border-radius: 4px;
  padding: 10px;
  width: 218px;
  display: flex;
  justify-content: center;
  ilign-items: center;
  margin-right: 20px;
  font-wheight: 600;
`;
const IntegerPart = styled.span`
  color: #fff;
  flex: 1;
  text-align: right;
`;

const DecimalPart = styled.span`
  color: #8a8a8a;
  flex: 1;
`;

//styles-end

class TradeOperations extends Component {
  state = {
    inputFiat: 1,
    inputSell: this.props.sell,
    inputPurchase: this.props.purchase,
    currentInput: "inputFiat",
    usd: this.props.walletUsd,
    btc: this.props.walletBtc,
    eth: this.props.walletEth
  };

  getDecimal = num => {
    var str = "" + num;
    var zeroPos = str.indexOf(".");
    if (zeroPos === -1) return 0;
    str = str.slice(zeroPos + 1);
    return str;
  };

  componentDidMount() {
    this.props.fetchWalletRequest();
  }

  componentWillReceiveProps(nextProps) {
    const { walletUsd, walletBtc, walletEth, sell, purchase } = nextProps;
    const { currentInput } = this.state;
    this.changeInputs(currentInput, sell, purchase);
    this.setState({
      usd: walletUsd,
      btc: walletBtc,
      eth: walletEth
    });
  }
  handleChange = event => {
    const { name, value } = event.target;
    const { sell, purchase } = this.props;

    this.setState(state => ({ [name]: value }));
    if (isNaN(event.target.value) || event.target.value === "") return;
    else this.changeInputs(event.target.name, sell, purchase);
  };

  handleBlur = () => {
    this.setState({ currentInput: "inputFiat" });
  };

  handleFocus = event => {
    this.setState({ currentInput: event.target.name });
  };

  handleSell = event => {
    const { currencyName } = this.props;
    const { inputFiat } = this.state;
    this.props.sellCurrencyRequest({ currencyName, value: inputFiat });
  };

  handleBuy = event => {
    const { currencyName } = this.props;
    const { inputFiat } = this.state;
    this.props.buyCurrencyRequest({ currencyName, value: inputFiat });
  };

  changeInputs(name, sell, purchase) {
    switch (name) {
      case "inputFiat": {
        this.setState(({ inputFiat }) => {
          const parsed = isNaN(inputFiat) ? 0 : parseFloat(inputFiat);
          return {
            inputSell: parsed * sell,
            inputPurchase: parsed * purchase
          };
        });
        break;
      }
      case "inputSell":
        this.setState(({ inputSell }) => {
          const parsedSell = isNaN(inputSell) ? 0 : parseFloat(inputSell);
          const nextFiat = parsedSell / sell;
          return {
            inputFiat: nextFiat,
            inputPurchase: nextFiat * purchase
          };
        });
        break;
      case "inputPurchase":
        this.setState(({ inputPurchase }) => {
          const parsedPurchase = isNaN(inputPurchase)
            ? 0
            : parseFloat(inputPurchase);
          const nextFiat = parsedPurchase / purchase;
          return {
            inputFiat: nextFiat,
            inputSell: nextFiat * sell
          };
        });
        break;
      default:
        break;
    }
  }
  render() {
    const { walletError, currencyName } = this.props;
    const { inputFiat, inputSell, inputPurchase } = this.state;

    const Currencies = ["usd", "btc", "eth"].map(el => (
      <WalletCurrency key={el}>
        <CurrencyQuantity>
          <IntegerPart>{Math.floor(this.state[el]) + "."}</IntegerPart>
          <DecimalPart>{this.getDecimal(this.state[el])}</DecimalPart>
        </CurrencyQuantity>
        {el.toUpperCase()}
      </WalletCurrency>
    ));

    return (
      <Container>
        <WalletWrapper>
          <h2>Ваш счет</h2>
          {Currencies}
        </WalletWrapper>
        <h2>Покупка/продажа</h2>
        <InputWrapper>
          <Input
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            name="inputFiat"
            value={inputFiat}
          />
          <Currency>{currencyName.toUpperCase()}</Currency>
        </InputWrapper>
        <div>
          <InputWrapper>
            <Input
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              name="inputPurchase"
              value={inputPurchase}
            />
            <Currency>$</Currency>
          </InputWrapper>
          <ButtonSell onClick={this.handleSell}>Продать</ButtonSell>
        </div>
        <div>
          <InputWrapper>
            <Input
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              name="inputSell"
              value={inputSell}
            />
            <Currency>$</Currency>
          </InputWrapper>
          <ButtonPurchase onClick={this.handleBuy}>Купить</ButtonPurchase>
        </div>
        {walletError && <p style={{ color: "red" }}>{walletError}</p>}
      </Container>
    );
  }
}
const mapStateToProps = state => ({
  sell:
    getSelected(state) === "btc"
      ? getCurrentBtcSell(state)
      : getCurrentEthSell(state),
  purchase:
    getSelected(state) === "btc"
      ? getCurrentBtcPurchase(state)
      : getCurrentEthPurchase(state),
  currencyName: getSelected(state),
  walletUsd: getWalletUsd(state),
  walletBtc: getWalletBtc(state),
  walletEth: getWalletEth(state),
  walletError: getWalletError(state)
});

const mapDispatchToProps = {
  buyCurrencyRequest,
  sellCurrencyRequest,
  fetchWalletRequest
};

export default connect(mapStateToProps, mapDispatchToProps)(TradeOperations);
