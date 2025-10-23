import NewContextMenu from "./dawn-ui/components/ContextMenu";

export default function Testing() {
  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        left: "200px",
        width: "300px",
        height: "300px",
        backgroundColor: "green",
      }}
    >
      <NewContextMenu
        options={{
          elements: [
            {
              type: "button",
              label: "test",
              onClick() {},
            },
            {
              type: "seperator",
            },
            {
              type: "submenu",
              label: "Submenu",
              menu: {
                elements: [
                  {
                    type: "button",
                    label: "lmao",
                    onClick() {},
                  },
                  {
                    type: "submenu",
                    label: "Submenu",
                    menu: {
                      elements: [
                        {
                          type: "button",
                          label: "lmao",
                          onClick() {},
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              type: "submenu",
              label: "Submenu",
              menu: {
                elements: [
                  {
                    type: "button",
                    label: "lmao",
                    onClick() {},
                  },
                ],
              },
            },
          ],
        }}
      />
    </div>
  );
}
