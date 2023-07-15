import { Input, InputProps, InputRef, Form } from "antd";
import React, { useState } from "react";
import { getMessage, ERROR } from "@/page/WarehouseItem/constants/messValidate";

interface InputAtnProps {
  className?: string;
  name: string;
  label: string;
}

const InputPrice = ({ className,name,label, ...props } : InputAtnProps) => {
  const [price, setPrice] = useState("");

//   const handleInputPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = e.target;

//     if (!value) {
//       setPrice("");
//       return;
//     }

//     const numericValue = value.replace(/[^\d]/g, "");
//     const formattedNumericValue = formatValue(numericValue);

//     setPrice(formattedNumericValue);
//     console.log(formattedNumericValue);
    
//     e.target.value = formattedNumericValue;
//   };

  const handleInputPrice = (e: any) => {
    const { value } = e.target;

    if (!value) {
      setPrice("");
      return;
    }

    const numericValue = value.replace(/[^\d]/g, "");
    const formattedNumericValue = formatValue(numericValue);

    setPrice(formattedNumericValue);
  };

  const formatValue = (numericValue: string) => {
    const parts = [];
    let index = numericValue.length;

    while (index > 0) {
      if (index - 3 > 0) {
        parts.unshift(numericValue.slice(index - 3, index));
      } else {
        parts.unshift(numericValue.slice(0, index));
      }
      index -= 3;
    }

    return parts.join(".");
  };

  const handleChange = (e:any) => {
    const { value } = e.target;
    setPrice(value);
  };


  return (
    <Form.Item
        label={label}
        name={name}
        rules={[
            { required: true, message: getMessage(ERROR.ERROR_1, 'Giá') },
            // {validator:  createRegexValidator(priceRegex, getMessage(ERROR.ERROR_2, 'Giá'))}
        ]}

    >

    <Input
      className={className}
      onChange={handleInputPrice}
      value={price}
      addonAfter="vnđ"
      />
      </Form.Item>
  )
};

export default InputPrice;
