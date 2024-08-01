// file to show the calenders
"use client";

// importing the required modules
import React, { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Calender = () => {
  const [date, setDate] = useState<Date | [Date, Date]>(new Date());

  const onChange: CalendarProps["onChange"] = (value) => {
    setDate(value as Date | [Date, Date]);
  };

  return (
    <div>
      <Calendar onChange={onChange} value={date} />
    </div>
  );
};

export default Calender;
