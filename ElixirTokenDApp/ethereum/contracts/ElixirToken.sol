pragma solidity ^0.4.25;

contract ElixirToken{
  string public name = "Elixir Token";
  string public symbol = "EXR";
  string public standard = "Elixir Token v1.0";
  uint256 public totalSupply;
  mapping (address => uint256) public balanceOf;

  function ElixirToken (uint256 _initialSupply) public {
    totalSupply = _initialSupply;
    balanceOf[msg.sender] = totalSupply;
  }

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  function transfer(address _to, uint256 _value) public returns(bool success) {
    require(balanceOf[msg.sender] >= _value && _value > 0);
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
    
  }

}
