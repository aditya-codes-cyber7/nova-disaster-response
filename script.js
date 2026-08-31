* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}



body {
  font-family: Arial, sans-serif;
  background: #081120;
  color: white;
}




nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 8%;
  border-bottom: 1px solid #1d2a3a;
  background: #0b1626;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}



.nav-links {
  display: flex;
  gap: 25px;
}

.nav-links a {
  text-decoration: none;
  color: #b8c4d1;
  transition: 0.3s;
}

.nav-links a:hover {
  color: white;
}




.hero {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 10%;
  gap: 60px;
}

.hero-content {
  max-width: 650px;
}

.tag {
  color: #4ade80;
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 58px;
  line-height: 1.1;
  margin-bottom: 25px;
}

.hero-text {
  color: #aab7c4;
  font-size: 18px;
  line-height: 1.7;
}




.buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

button {
  border: none;
  padding: 14px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.3s;
}



.sos-btn {
  background: #ef4444;
  color: white;
}

.sos-btn:hover {
  transform: translateY(-3px);
}



.report-btn {
  background: transparent;
  border: 1px solid #334155;
  color: white;
}

.report-btn:hover {
  background: #172235;
}




.hero-card {
  background: #101c2e;
  border: 1px solid #24344a;
  padding: 30px;
  border-radius: 15px;
  width: 340px;
}

.status {
  color: #4ade80;
  font-size: 14px;
  margin-bottom: 30px;
}



.pulse {
  display: inline-block;
  width: 9px;
  height: 9px;
  background: #4ade80;
  border-radius: 50%;
  margin-right: 8px;
}

.hero-card h3 {
  font-size: 25px;
  margin-bottom: 15px;
}

.hero-card p {
  color: #9aa9b8;
  line-height: 1.6;
}




.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #24344a;
}

.stats div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stats strong {
  font-size: 20px;
}

.stats span {
  color: #8b9aaa;
  font-size: 13px;
}




.features {
  padding: 80px 10%;
  text-align: center;
  background: #0b1626;
}

.features h2 {
  font-size: 38px;
  margin-bottom: 15px;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 50px;
}



.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  background: #101c2e;
  border: 1px solid #24344a;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: left;
  transition: 0.3s;
}



.feature-card:hover {
  transform: translateY(-7px);
  border-color: #475569;
}

.icon {
  font-size: 30px;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 12px;
}

.feature-card p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}



.emergency-section {
  text-align: center;
  padding: 90px 20px;
}

.emergency-section h2 {
  font-size: 38px;
  margin-bottom: 15px;
}

.emergency-section p {
  color: #94a3b8;
  max-width: 600px;
  margin: auto;
  line-height: 1.6;
}


.big-sos {
  margin-top: 30px;
  background: #ef4444;
  color: white;
  font-weight: bold;
  padding: 17px 35px;
}

.big-sos:hover {
  transform: scale(1.05);
}




footer {
  text-align: center;
  padding: 25px;
  border-top: 1px solid #1d2a3a;
  color: #718096;
  font-size: 14px;
}




@media (max-width: 900px) {

  .hero {
    flex-direction: column;
    text-align: center;
    padding: 60px 8%;
  }

  .hero h1 {
    font-size: 42px;
  }

  .buttons {
    justify-content: center;
  }



  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-card {
    width: 100%;
    max-width: 450px;
  }

}




@media (max-width: 600px) {

  nav {
    padding: 18px 5%;
  }



  .nav-links {
    display: none;
  }

  .hero h1 {
    font-size: 35px;
  }



  .feature-grid {
    grid-template-columns: 1fr;
  }

  .features h2,
  .emergency-section h2 {
    font-size: 30px;
  }

}
