import React, { useState, useRef } from "react";
import { SafeAreaView } from "react-native";
import PhoneInput from "react-native-phone-number-input";

export default function FlagTestScreen() {
  const [phone, setPhone] = useState("");
  const phoneInput = useRef(null);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <PhoneInput
        ref={phoneInput}
        defaultValue={phone}
        defaultCode="US"
        layout="first"
        onChangeFormattedText={setPhone}
        containerStyle={{
          width: 320,
          backgroundColor: "#e0e7ff",
          borderWidth: 2,
          borderColor: "#2563eb",
          borderRadius: 12,
        }}
        textContainerStyle={{
          backgroundColor: "#fffbe6",
          borderRadius: 12,
        }}
        flagButtonStyle={{
          borderWidth: 2,
          borderColor: "#ef4444",
          borderRadius: 8,
          backgroundColor: "#fff0f0",
        }}
      />
    </SafeAreaView>
  );
}
