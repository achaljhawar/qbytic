// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockChainlinkPriceFeed is AggregatorV3Interface {
    uint8 public override decimals;
    string public override description;
    uint256 public override version;

    int256 private _price;
    uint256 private _updatedAt;
    uint80 private _roundId;

    constructor(
        uint8 _decimals,
        string memory _description,
        uint256 _version,
        int256 _initialPrice
    ) {
        decimals = _decimals;
        description = _description;
        version = _version;
        _price = _initialPrice;
        _updatedAt = block.timestamp;
        _roundId = 1;
    }

    function getRoundData(uint80 roundId_) external view override returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (roundId_, _price, _updatedAt, _updatedAt, roundId_);
    }

    function latestRoundData() external view override returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (_roundId, _price, _updatedAt, _updatedAt, _roundId);
    }

    // Admin functions for testing
    function updateAnswer(int256 _answer) external {
        _price = _answer;
        _updatedAt = block.timestamp;
        _roundId++;
    }

    function updateTimestamp(uint256 _timestamp) external {
        _updatedAt = _timestamp;
    }
}