  let step = 0;
    let userData = {};

    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const optionButtons = document.getElementById("optionButtons");

    const indianStates = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
      "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
      "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ];

    function addMessage(content, sender = "user") {
      const msg = document.createElement("div");
      msg.className = sender + "-message";
      msg.textContent = content;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showOptions(options) {
      optionButtons.innerHTML = "";
      options.forEach(option => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = option;
        btn.className = "option-button";
        btn.onclick = () => {
          userInput.value = option;
          document.getElementById("chatForm").dispatchEvent(new Event("submit"));
        };
        optionButtons.appendChild(btn);
      });
    }

    document.getElementById("chatForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = userInput.value.trim();
      if (!input) return;

      addMessage(input, "user");
      userInput.value = "";
      optionButtons.innerHTML = "";

      if (step === 0) {
        const age = parseInt(input);
        if (isNaN(age) || age <= 0 || age > 120) {
          addMessage("⚠️ Please enter a valid age (1–120).", "bot");
          return;
        }
        userData.age = age;
        addMessage("📌 Got it! What's your gender?", "bot");
        showOptions(["Male", "Female", "Other"]);
        step++;
      } else if (step === 1) {
        const gender = input.toLowerCase();
        if (!["male", "female", "other"].includes(gender)) {
          addMessage("⚠️ Please select from: Male, Female, Other.", "bot");
          showOptions(["Male", "Female", "Other"]);
          return;
        }
        userData.gender = input;
        addMessage("📍 Great. Which state are you from?", "bot");
        showOptions(indianStates);
        step++;
      } else if (step === 2) {
        if (!indianStates.includes(input)) {
          addMessage("⚠️ Please select a valid Indian state.", "bot");
          showOptions(indianStates);
          return;
        }
        userData.state = input;
        addMessage("🎯 Lastly, what's your purpose or need?", "bot");
        step++;
      } else if (step === 3) {
        userData.need = input;
        addMessage("🔎 Finding schemes for you...", "bot");
      
        
        const res = await fetch("/get_schemes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        });

        const data = await res.json();

        try {
          const schemes = data.schemes;
          if (!schemes.length) {
            addMessage("❌ No matching schemes found. Please try different details.", "bot");
          } else {
            schemes.forEach(scheme => {
              addMessage(`📌 ${scheme.name}\n🔸 ${scheme.benefit}\n🔗 ${scheme.link}`, "bot");
            });
          }
        } catch {
          addMessage("❌ Sorry, couldn't fetch schemes. Try again later.", "bot");
        }

        setTimeout(() => {
          addMessage("🔁 Want to search again?", "bot");
          showOptions(["Yes", "No"]);
          step = 4;
        }, 1000);
      } else if (step === 4) {
        const choice = input.toLowerCase();
        if (choice === "yes") {
          userData = {};
          step = 0;
          addMessage("👋 Awesome! How old are you?", "bot");
        } else if (choice === "no") {
          addMessage("✅ Thank you for using SchemeBot. See you again!", "bot");
          userInput.disabled = true;
          document.querySelector("button[type='submit']").disabled = true;
        } else {
          addMessage("❓ Please choose Yes or No.", "bot");
          showOptions(["Yes", "No"]);
        }
      }
    });