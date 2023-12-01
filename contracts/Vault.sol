// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @dev Error indicating the token is not whitelisted.
 */
error TokenNotWhitelisted();

/**
 * @dev Error indicating the balance of the user is insufficient to withdraw.
 */
error InsufficientBalance();

/**
 * @title Vault
 * @dev A smart contract for managing deposits and withdrawals of ERC-20 tokens with whitelisting and administrative controls.
 * @notice This contract allows users to deposit and withdraw ERC-20 tokens. It supports token whitelisting to restrict
 * transactions to specific tokens. Administrative controls include pausing/unpausing the contract, whitelisting tokens,
 * removing tokens from the whitelist, and managing administrators.
 * @dev The contract utilizes OpenZeppelin's Ownable, AccessControl, Pausable, and ERC-20 interfaces.
 */
contract Vault is Ownable, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev Mapping to track whether a token is whitelisted.
     */
    mapping(address => bool) public whitelistedTokens;
    /**
     * @dev Mapping to track the balance of users for each token. token => wallet => balance
     */
    mapping(address => mapping(address => uint256)) public balances;

    /**
     * @dev Emitted when a user deposits tokens into the vault.
     * @param user The address of the user making the deposit.
     * @param token The address of the deposited ERC-20 token.
     * @param amount The amount of tokens deposited.
     */
    event Deposit(address indexed user, address indexed token, uint256 amount);

    /**
     * @dev Emitted when a user withdraws tokens from the vault.
     * @param user The address of the user making the withdrawal.
     * @param token The address of the withdrawn ERC-20 token.
     * @param amount The amount of tokens withdrawn.
     */
    event Withdrawal(address indexed user, address indexed token, uint256 amount);

    /**
     * @dev Modifier to restrict functions to only whitelisted tokens.
     * @param token The address of the token being checked.
     */
    modifier onlyWhitelisted(address token) {
        if (!whitelistedTokens[token]) revert TokenNotWhitelisted();
        _;
    }

    /**
     * @dev Constructor to initialize the contract with the deploying address as the initial owner.
     */
    constructor() Ownable(_msgSender()) {}

    /**
     * @dev Deposits ERC-20 tokens into the vault.
     * @param token The address of the deposited ERC-20 token.
     * @param amount The amount of tokens to deposit.
     * @notice Only available when the contract is not paused and the token is whitelisted.
     */
    function deposit(address token, uint256 amount) external whenNotPaused onlyWhitelisted(token) {
        IERC20(token).safeTransferFrom(_msgSender(), address(this), amount);

        balances[token][_msgSender()] += amount;
        emit Deposit(_msgSender(), token, amount);
    }

    /**
     * @dev Withdraws ERC-20 tokens from the vault.
     * @param token The address of the withdrawn ERC-20 token.
     * @param amount The amount of tokens to withdraw.
     * @notice Only available when the contract is not paused and the token is whitelisted.
     */
    function withdraw(address token, uint256 amount) external whenNotPaused onlyWhitelisted(token) {
        if (balances[token][_msgSender()] < amount) revert InsufficientBalance();

        IERC20(token).safeTransfer(_msgSender(), amount);

        balances[token][_msgSender()] -= amount;
        emit Withdrawal(_msgSender(), token, amount);
    }

    /**
     * @dev Pauses the contract to prevent new deposits or withdrawals.
     * @notice Only available to users with the ADMIN_ROLE.
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract to allow new deposits or withdrawals.
     * @notice Only available to users with the ADMIN_ROLE.
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Whitelists a token to allow deposits and withdrawals.
     * @param token The address of the token to be whitelisted.
     * @notice Only available to users with the ADMIN_ROLE.
     */
    function whitelistToken(address token) external onlyRole(ADMIN_ROLE) {
        whitelistedTokens[token] = true;
    }

    /**
     * @dev Removes a token from the whitelist, preventing deposits and withdrawals.
     * @param token The address of the token to be removed from the whitelist.
     * @notice Only available to users with the ADMIN_ROLE.
     */
    function removeTokenFromWhitelist(address token) external onlyRole(ADMIN_ROLE) {
        whitelistedTokens[token] = false;
    }

    /**
     * @dev Adds a new administrator with the ADMIN_ROLE.
     * @param newAdmin The address of the new administrator.
     * @return A boolean indicating whether the operation was successful.
     * @notice Only available to the contract owner.
     */
    function addAdmin(address newAdmin) external onlyOwner returns (bool) {
        return _grantRole(ADMIN_ROLE, newAdmin);
    }

    /**
     * @dev Removes an administrator with the ADMIN_ROLE.
     * @param targetAdmin The address of the administrator to be removed.
     * @return A boolean indicating whether the operation was successful.
     * @notice Only available to the contract owner.
     */
    function removeAdmin(address targetAdmin) external onlyOwner returns (bool) {
        return _revokeRole(ADMIN_ROLE, targetAdmin);
    }
}