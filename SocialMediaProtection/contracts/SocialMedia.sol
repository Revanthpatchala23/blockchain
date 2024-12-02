// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialMedia {
    struct UserProfile {
        string username;
        string bio;
        bool isPrivate;
    }

    mapping(address => UserProfile) private userProfiles;

    function createProfile(string memory _username, string memory _bio, bool _isPrivate) public {
        userProfiles[msg.sender] = UserProfile(_username, _bio, _isPrivate);
    }

    function getProfile(address _user) public view returns (string memory, string memory, bool) {
        UserProfile memory profile = userProfiles[_user];
        return (profile.username, profile.bio, profile.isPrivate);
    }

    function setPrivacy(bool _isPrivate) public {
        userProfiles[msg.sender].isPrivate = _isPrivate;
    }
}
