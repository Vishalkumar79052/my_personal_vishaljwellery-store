/**
 * Computes synchronized order timeline stages based strictly on backend order status
 * and tracking data.
 *
 * Rules:
 * 1. For pending orders: ONLY "Order Placed" is marked as completed.
 * 2. Preparation is ONLY completed if the order has moved to 'shipped' or 'delivered'.
 *    If status is 'processing', preparation is active / in-progress, NOT complete.
 * 3. Dispatch is ONLY completed if status is 'delivered' OR (status is 'shipped' AND actual trackingNumber exists).
 *    If status is 'shipped' without tracking data, dispatch is active / awaiting waybill, NOT complete.
 * 4. Delivery is ONLY completed if status is 'delivered'.
 */
export const computeOrderTimeline = (order) => {
  if (!order) return [];

  const status = (order.status || "pending").toLowerCase();
  const hasTracking = Boolean(
    order.trackingNumber && String(order.trackingNumber).trim().length > 0
  );
  const isCancelled = status === "cancelled";

  // Stage 1: Order Placed
  const step1 = {
    key: "placed",
    number: 1,
    title: "Order Placed",
    subtitle: "Atelier Ledger Recorded",
    statusText: isCancelled
      ? "Order Cancelled"
      : status === "confirmed"
      ? "Confirmed by Atelier"
      : "Acquisition Verified",
    timestamp: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null,
    isCompleted: !isCancelled,
    isActive: false,
    isPending: false,
  };

  // Stage 2: Preparation
  const isPrepCompleted = !isCancelled && (status === "shipped" || status === "delivered");
  const isPrepActive = !isCancelled && status === "processing";
  const isPrepPending = !isCancelled && (status === "pending" || status === "confirmed");

  const step2 = {
    key: "processing",
    number: 2,
    title: "Atelier Preparation",
    subtitle: "Gemstone Inspection & Crafting",
    statusText: isCancelled
      ? "Preparation Ceased"
      : isPrepCompleted
      ? "Crafting & Inspection Complete"
      : isPrepActive
      ? "Master Crafting In Progress"
      : status === "confirmed"
      ? "Confirmed · In Workshop Queue"
      : "Awaiting Atelier Confirmation",
    timestamp: order.processingAt
      ? new Date(order.processingAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null,
    isCompleted: isPrepCompleted,
    isActive: isPrepActive,
    isPending: isPrepPending || isCancelled,
  };

  // Stage 3: Vault Dispatch
  const isDispatchCompleted =
    !isCancelled && (status === "delivered" || (status === "shipped" && hasTracking));
  const isDispatchActive = !isCancelled && status === "shipped" && !hasTracking;
  const isDispatchPending = !isCancelled && (status === "pending" || status === "processing");

  const step3 = {
    key: "shipped",
    number: 3,
    title: "Vault Dispatch",
    subtitle: hasTracking
      ? `${order.carrier || "Armoured Courier"} · AWB: ${order.trackingNumber}`
      : "Insured Courier Handover",
    statusText: isCancelled
      ? "Not Dispatched"
      : isDispatchCompleted
      ? "Dispatched & In Transit"
      : isDispatchActive
      ? "Awaiting Waybill Generation"
      : "Pending Atelier Fulfillment",
    carrier: order.carrier || "",
    trackingNumber: order.trackingNumber || "",
    hasTracking,
    isCompleted: isDispatchCompleted,
    isActive: isDispatchActive,
    isPending: isDispatchPending || isCancelled,
  };

  // Stage 4: Delivered
  const isDeliveredCompleted = !isCancelled && status === "delivered";
  const isDeliveredActive = !isCancelled && status === "shipped";
  const isDeliveredPending =
    !isCancelled && (status === "pending" || status === "processing");

  const step4 = {
    key: "delivered",
    number: 4,
    title: "Delivered to Patron",
    subtitle: "Vault / Signature Verified",
    statusText: isCancelled
      ? "Order Cancelled"
      : isDeliveredCompleted
      ? "Safely Handed to Patron"
      : isDeliveredActive
      ? "Out for Courier Delivery"
      : "Pending Final Delivery",
    timestamp: order.deliveredAt
      ? new Date(order.deliveredAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null,
    isCompleted: isDeliveredCompleted,
    isActive: isDeliveredActive,
    isPending: isDeliveredPending || isCancelled,
  };

  return [step1, step2, step3, step4];
};
