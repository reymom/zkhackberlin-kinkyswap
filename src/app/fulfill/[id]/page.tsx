"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FulfillOrderPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        fetch("/api/orders")
            .then(res => res.json())
            .then(data => {
                const found = data.orders.find((o: any) => o.id === id);
                setOrder(found);
            });
    }, [id]);

    const fulfillOrder = () => {
        console.log("fulfilling", order);
        // workerRef.current?.postMessage(...)
    };

    if (!order) return <p>Loading...</p>;

    return (
        <main style={{ padding: "2rem" }}>
            <h1>Fulfill Order</h1>
            <p>
                Swap {order.amountA} {order.tokenA} → {order.amountB} {order.tokenB}
            </p>
            <button onClick={fulfillOrder}>Execute Escrow</button>
        </main>
    );
}
