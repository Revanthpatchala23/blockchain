import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract address of the deployed SocialMedia contract
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract ABI
const abi = {
  "_format": "hh-sol-artifact-1",
  "contractName": "SocialMedia",
  "sourceName": "contracts/SocialMedia.sol",
  "abi": [
    {
      "inputs": [
        { "internalType": "string", "name": "_username", "type": "string" },
        { "internalType": "string", "name": "_bio", "type": "string" },
        { "internalType": "bool", "name": "_isPrivate", "type": "bool" }
      ],
      "name": "createProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
      "name": "getProfile",
      "outputs": [
        { "internalType": "string", "name": "", "type": "string" },
        { "internalType": "string", "name": "", "type": "string" },
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bool", "name": "_isPrivate", "type": "bool" }],
      "name": "setPrivacy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deleteProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x608060405234801561001057600080fd5b5061080b806100206000396000f3fe...",
  "linkReferences": {},
  "deployedLinkReferences": {}
};

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [platform, setPlatform] = useState("Instagram");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [profiles, setProfiles] = useState([]); // Track multiple profiles
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    gender: "",
    nationality: ""
  });
  const [education, setEducation] = useState("");
  const [professional, setProfessional] = useState("");
  const [profilePicture, setProfilePicture] = useState(null); // Track profile picture

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          const signer = await newProvider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, abi.abi, signer);
          setProvider(newProvider);
          setContract(contractInstance);
          console.log("Provider and Contract initialized");
        } catch (error) {
          console.error("Error initializing provider and contract:", error);
        }
      } else {
        alert("Please install MetaMask!");
      }
    }
    init();
  }, []);

  const connectWallet = async () => {
    try {
      if (!provider) throw new Error("Provider is not set.");
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      console.log("Connected account:", accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result); // Store the uploaded image as a base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const createProfile = async () => {
    try {
      if (!contract) throw new Error("Contract is not set.");
      const fullBio = `
        Platform: ${platform}
        Bio: ${bio}
        Personal Info - Name: ${personalInfo.name}, Gender: ${personalInfo.gender}, Nationality: ${personalInfo.nationality}
        Education: ${education}
        Professional: ${professional}
      `;
      const tx = await contract.createProfile(username, fullBio, isPrivate);
      await tx.wait();
      alert("Profile created!");
      console.log("Profile created with username:", username);

      // Immediately update profiles state with new profile information
      setProfiles((prevProfiles) => [
        ...prevProfiles,
        { username, bio: fullBio, isPrivate, profilePicture }
      ]);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const deleteProfile = async (index) => {
    try {
      if (!contract) throw new Error("Contract is not set.");
      const tx = await contract.deleteProfile();
      await tx.wait();
      alert("Profile deleted!");

      // Remove the deleted profile from the state
      setProfiles((prevProfiles) => {
        const updatedProfiles = [...prevProfiles];
        updatedProfiles.splice(index, 1); // Remove the profile at the given index
        return updatedProfiles;
      });
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  return (
    <div>
      <h1>Social Media DApp</h1>
      {!account && <button onClick={connectWallet}>Connect Wallet</button>}
      {account && (
        <>
          <h3>Create Profile</h3>
          <label>
            Platform:
            <select onChange={(e) => setPlatform(e.target.value)}>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
            </select>
          </label>
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input type="text" placeholder="Bio" onChange={(e) => setBio(e.target.value)} />

          <h4>Personal Information</h4>
          <input type="text" placeholder="Name" onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
          <input type="text" placeholder="Gender" onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })} />
          <input type="text" placeholder="Nationality" onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })} />

          <h4>Education</h4>
          <input type="text" placeholder="Education Details" onChange={(e) => setEducation(e.target.value)} />

          <h4>Professional</h4>
          <input type="text" placeholder="Professional Details" onChange={(e) => setProfessional(e.target.value)} />

          <label>
            Private:
            <input type="checkbox" onChange={(e) => setIsPrivate(e.target.checked)} />
          </label>
          <label>
            Profile Picture:
            <input type="file" accept="image/*" onChange={handlePictureUpload} />
          </label>
          {profilePicture && <img src={profilePicture} alt="Profile Preview" style={{ width: "100px", height: "100px" }} />}
          <button onClick={createProfile}>Create Profile</button>

          <h3>Profiles Created: {profiles.length}</h3>
          <ul>
            {profiles.map((profile, index) => (
              <li key={index}>
                <p>Username: {profile.username}</p>
                <p>Bio: {profile.bio}</p>
                <p>Private: {profile.isPrivate ? "Yes" : "No"}</p>
                {profile.profilePicture && <img src={profile.profilePicture} alt="Profile" style={{ width: "100px", height: "100px" }} />}
                <button onClick={() => deleteProfile(index)}>Delete Profile</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
