export const OrderFlows = (flows) => {
  let counter = 1;
  const sortedFlows = [];

  for (const _ in flows) {
    for (const index in flows) {
      if (flows[index].id === counter) {
        sortedFlows.push(flows[index]);
        counter++;
        break;
      }
    }
  }

  return sortedFlows;
};

export const TrimFlows = (flows) => {
  const trimmedFlows = [];

  for (const index in flows) {
    const flowItem = flows[index];
    if (flowItem.itemType !== "node") continue;

    trimmedFlows.push(flowItem);
  }

  return trimmedFlows;
};

export const PrepareFlows = (flows) => {
  const preparedFlows = [];
  const [startFlow, endflow] = HeaderFlows();
  endflow.id = flows.length + 1;

  preparedFlows.push(startFlow);

  for (const index in flows) {
    const flowItem = flows[index];
    preparedFlows.push(flowItem);

    if (Number(index) + 1 === flows.length) preparedFlows.push(endflow);
  }

  return preparedFlows;
};

export const HeaderFlows = () => {
  return [
    {
      itemType: "start",
      label: "Start of a Request",
      desc: "Info: Starting a request now",
      id: 0,
      listId: 0,
      isActive: false,
    },
    {
      itemType: "end",
      label: "End of a Request",
      desc: "Info: Request Service has been ended",
      id: 1,
      listId: 0,
      isActive: false,
    },
  ];
};
