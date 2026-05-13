export const VARIABLE_CATALOG = [
    {
        category: "contact",
        variables: [
            {
                key: "contact.name",
                label: "Name",
                type: "string"
            },
            {
                key: "contact.phone",
                label: "Phone Number",
                type: "string"
            },
        ]
    },
    {
        category: "system",
        variables: [
            {
                key: "system.current_date",
                label: "Current Date",
                type: "date"
            },
            {
                key: "system.current_time",
                label: "Current Time",
                type: "time"
            }
        ]
    },
    {
        category: "order",
        variables: [
            {
                key: "order.id",
                label: "Order Id",
                type: "string"
            },
            {
                key: "order.amount",
                label: "Order Amount",
                type: "string"
            }
        ]
    },
]