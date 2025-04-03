.container {
  text-align: center;
  font-family: Arial, sans-serif;
  animation: fadeIn 1s ease-in-out;
}

h1 {
  font-size: 2rem;
  color: #ff4500;
  text-shadow: 3px 3px 0px black;
  animation: bounce 1s infinite alternate;
}

h2 {
  font-size: 1.5rem;
  color: #333;
}

.bar {
  position: relative;
  width: 80%;
  height: 20px;
  background: #ddd;
  margin: 20px auto;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid black;
}

.greenZone {
  position: absolute;
  left: 40%;
  width: 20%;
  height: 100%;
  background: limegreen;
}

.marker {
  position: absolute;
  width: 20px;
  height: 20px;
  background: red;
  border-radius: 50%;
  transition: left 0.3s linear; /* Noch langsamere Bewegung */
}

.button {
  background: gold;
  border: none;
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 10px;
  margin-top: 20px;
  font-weight: bold;
  box-shadow: 3px 3px 0px black;
  transition: transform 0.1s;
}

.button:hover {
  transform: scale(1.1);
  background: orange;
}

.boo {
  color: red;
  font-size: 2rem;
  font-weight: bold;
  animation: shake 0.5s infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

@keyframes shake {
  from { transform: rotate(-3deg); }
  to { transform: rotate(3deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
