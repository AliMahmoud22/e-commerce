import React, { useEffect, useState } from "react";
import axios from "axios";

const Overview = () => {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get("/api/orders/count");
        setOrderCount(response.data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchOrderCount();
  }, []);

  return (
    <div className="overview">
      <h2>Admin Overview</h2>
      <p>Total Orders: {orderCount}</p>
    </div>
  );
};

export default Overview;
