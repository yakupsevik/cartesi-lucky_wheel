import { useState } from "react";
import { advanceInput } from "@mugen-builders/client";
import { ethers } from "ethers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

/* Images */
import luckyWheelButton from "./assets/icons/lucky_wheel-icon.png";
import lucky_wheel_image from "./assets/images/lucky_wheel-image.png";
import lucky_wheel_pointer from "./assets/images/lucky_wheel-pointer.png";

/* Seperator Image Import */
import seperator from "./assets/images/seperators/line-seperator.png";

function App() {
  const multipliers = [
    {
      _id: "1",
      multiplier: "2",
      probability: 30,
    },
    {
      _id: "2",
      multiplier: "3",
      probability: 20,
    },
    {
      _id: "3",
      multiplier: "5",
      probability: 10,
    },
    {
      _id: "4",
      multiplier: "10",
      probability: 5,
    },
    {
      _id: "5",
      multiplier: "20",
      probability: 1,
    },
  ];
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);
  const [rotateDegree, setRotateDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngles = {
    25: [12, -2],
    10: [-6, -32],
    5: [-36, -92],
    3: [-97, -192],
    2: [-197, -343],
  };

  const spin = async () => {
    if (selectedMultiplier === null) return toast.error("Please select a slice!");
    if (isSpinning) return;
    if (typeof window.ethereum === "undefined") return;

    try {
      // Ethereum provider and signer (Metamask or other wallet)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request the user to connect
      const signer = provider.getSigner();
      await signer.getAddress();

      // DApp address (you will need to replace this with your actual DApp address) need
      const dappAddress = "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e";

      // Prepare the payload (encode as hex string)
      const payload = JSON.stringify({ selectedMultiplier, multipliers });

      // Send the payload to the Cartesi Rollups backend
      const result = await advanceInput(signer, dappAddress, payload);

      // Spin the wheel with the result
      if (result) {
        console.log(result);
        spinWheel(result.winnerMultiplier);
      }

      setTimeout(() => {
        if (result.resId === "won-spin") {
          toast.success("Won!");
        } else {
          toast.error("Lose!");
        }
        resetWheel();
      }, 4000);
    } catch (error) {
      console.error("Error during spin:", error);
    }
  };

  const getRandomAngle = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const spinWheel = (winningSegment) => {
    setIsSpinning(true);

    // Calculate spin
    const fullSpins = 360 * 4; // 5 full spins
    const [minAngle, maxAngle] = segmentAngles[winningSegment];
    const stopAngle = getRandomAngle(minAngle, maxAngle);

    const finalRotate = fullSpins + stopAngle; // Full spins + final stop angle
    setRotateDegree(finalRotate);

    setTimeout(() => {
      setIsSpinning(false);
    }, 6000); // Animation duration (6 seconds)
  };

  const resetWheel = () => {
    setRotateDegree(0);
  };

  return (
    <main className="on-chain-page">
      <ToastContainer position="top-right" autoClose={1500} closeOnClick={true} />
      <div className="modal lucky_wheel">
        <div className="modal-container">
          <div className="modal-head">
            <div className="modal-head-container">
              <div className="modal-head-title-container">
                <span className="modal-head-title">Lucky Wheel</span>
              </div>
            </div>
            <img className="seperator" alt="seperator" src={seperator} />
          </div>
          <div className="modal-content">
            <div className="lucky_wheel-content-container">
              <div className="left">
                <div className="input-container">
                  <div className="title-container">
                    <div className="seperator"></div>
                    <h2>Add GLD</h2>
                    <div className="seperator"></div>
                  </div>
                  <span className="gld-price">1000 GLD</span>
                </div>
                <div className="input-container">
                  <div className="title-container">
                    <div className="seperator"></div>
                    <h2>Choose Slice</h2>
                    <div className="seperator"></div>
                  </div>
                  <ul className="slices">
                    {multipliers.map((data) => (
                      <li className={`slice ${selectedMultiplier === data.multiplier ? "selected" : ""}`} key={data._id}>
                        <button className="slice-button" onClick={() => setSelectedMultiplier(data.multiplier)}>
                          X{data.multiplier}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <img src={luckyWheelButton} alt="Lucky Wheel Icon" className="icon" />
                <button className={`spin-button ${isSpinning ? "disabled" : ""}`} onClick={() => spin()}>
                  <span>Spin The Wheel</span>
                </button>
              </div>
              <div className="right">
                <div className="wheel-container">
                  <div
                    className={`wheel ${isSpinning ? "transition" : "reset-transition"}`}
                    style={{ transform: `rotate(${rotateDegree}deg)` }}
                  >
                    <img src={lucky_wheel_image} alt="Wheel" draggable={false} />
                    {multipliers.map((data, index) => (
                      <div key={data._id} className={`multiplier-segment segment-${index}`}>
                        <span className="multiplier-text">{data.multiplier}X</span>
                      </div>
                    ))}
                  </div>
                  <img src={lucky_wheel_pointer} alt="Pointer" className="pointer" draggable={false} />
                  <img src="/gladian-logo-icon.png" alt="Logo Icon" className="logo-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
