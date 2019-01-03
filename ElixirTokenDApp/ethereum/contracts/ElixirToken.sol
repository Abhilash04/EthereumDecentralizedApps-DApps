pragma solidity ^0.4.25;

contract Token {

  function totalSupply() public view returns(uint256 supply) {}
  function balanceOf(address _owner) public view returns (uint256 balance) {}
  function transfer(address _to, uint256 _value) public returns (bool success) {}
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {}
  function approve(address _sender, uint256 _value) public returns (bool success) {}
  function allowance(address _owner, address _spender) public returns (bool remaining) {}

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

}

contract StandardToken is Token {
  uint256 public totalSupply;
  mapping (address => uint256) public balanceOf;
  mapping (address => mapping(address => uint256)) public allowance;
  using SafeMath for uint256;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  function transfer(address _to, uint256 _value) public returns(bool success) {
    require(balanceOf[msg.sender] >= _value);
    balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value) public returns(bool success){
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
    require(balanceOf[_from] >= _value && allowance[_from][msg.sender] >= _value);
    balanceOf[_from] = balanceOf[_from].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);
    allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

}

contract ElixirToken is StandardToken {
  using SafeMath for uint256;
  string public name = "Elixir Token";
  string public symbol = "ELXR";
  string public standard = "ELXR v1.0";
  address admin;
  uint256 public tokenPrice;
  uint256 public tokenSold;
  uint256 public tokensAvailable;

  event Sell(address _buyer, uint256 amount);

  function ElixirToken (uint256 _initialSupply, uint256 _tokenPrice) public {
    totalSupply = _initialSupply;
    tokenPrice = _tokenPrice;
    balanceOf[msg.sender] = totalSupply;
    admin = msg.sender;
    /* tokensAvailable = (portion.div(base)).mul(_initialSupply); */
  }

  function buyTokens(uint256 _numberOfTokens) public payable {
    require(msg.value == _numberOfTokens.mul(tokenPrice));
    require(this.balanceOf(this) >= _numberOfTokens);
    require(this.transfer(msg.sender, _numberOfTokens));
    tokenSold = tokenSold.add(_numberOfTokens);
    emit Sell(msg.sender, _numberOfTokens);
  }

  function endSale() public {
    require(msg.sender == admin);
    require(this.transfer(admin, this.balanceOf(this)));
    selfdestruct(admin);
  }

}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a * b;
      assert(a == 0 || c / a == b);
      return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a / b;
      assert(b > 0);
      assert(a == b * c + a % b);
      return c;
  }

}
