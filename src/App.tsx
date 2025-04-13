import { useEffect, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import { Toggle } from "./components/ui/toggle";
import { ModeToggle } from "./mode-toggle";
import { Input } from "./components/ui/input";

import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { cn } from "./lib/utils";
import { useToast } from "./hooks/use-toast";

type AccountType = {
  name: string;
  email: string;
  is_active: boolean;
};

function App() {
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<AccountType | null>(null);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [fetchedAccounts, user] = await Promise.all([
        invoke("list_accounts"),
        invoke("get_current_user"),
      ]);
      setAccounts(fetchedAccounts as AccountType[]);
      setCurrentUser(user as AccountType);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch data",
        description: error?.message,
      });
    }
  };

  const handleAddAccount = async (values: { name: string; email: string }) => {
    try {
      await invoke("add_account", {
        name: values.name,
        email: values.email,
      });
      toast({
        title: "Account added successfully",
      });
      // message.success("Account added successfully");
      // setNewAccountSSHKey(publicKey);
      fetchData();
      setPage(1);
      return true;
    } catch (error: any) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Failed to add account",
        description: error?.message,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
    const removeAccountListener = listen("account-removed", (event) => {
      const removedEmail = event.payload;
      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.email !== removedEmail)
      );
      if (currentUser && currentUser.email === removedEmail) {
        setCurrentUser(null);
      }
    });
    const removeAllAccountsListener = listen("all-accounts-removed", () => {
      setAccounts([]);
      setCurrentUser(null);
    });
    return () => {
      removeAccountListener.then((unlisten) => unlisten());
      removeAllAccountsListener.then((unlisten) => unlisten());
    };
  }, []);

  // const onCloseClick = () => {
  //   window.close();
  // };

  return (
    <main className="flex bg-background h-screen overflow-hidden flex-col">
      <div className="flex flex-none h-16 justify-between items-center px-6 border-b">
        <h1 className="text-2xl font-bold">Git Account Switcher</h1>
        <div className="flex items-center gap-8">
          <ModeToggle />
          {/* <Button onClick={onCloseClick}>Exit</Button> */}
        </div>
      </div>
      <div className="border-b px-6">
        <p className="text-sm font-bold">
          Current User : {currentUser?.name} ({currentUser?.email})
        </p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 flex flex-col p-3 gap-3 border-r">
          <button
            onClick={() => setPage(1)}
            className={cn([
              "flex items-center gap-2 rounded-md px-6 py-2",
              page === 1
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
            ])}
          >
            <span>List Accounts</span>
          </button>
          <button
            onClick={() => setPage(2)}
            className={cn([
              "flex items-center gap-2 rounded-md px-6 py-2",
              page === 2
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:bg-accent/80",
            ])}
          >
            <span>Add Accounts</span>
          </button>
        </div>
        {page == 1 && (
          <div className="flex-1 p-3 flex flex-col gap-3 overflow-auto">
            {accounts.length === 0 && (
              <p className="text-center text-muted-foreground">
                No accounts added yet
              </p>
            )}
            {accounts.map((account, index) => (
              <ListItem account={account} key={index} refresh={fetchData} />
            ))}
          </div>
        )}
        {page == 2 && <AddPage onSubmit={handleAddAccount} />}
      </div>
    </main>
  );
}

export default App;

const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

type ListItemProps = {
  refresh?: () => void;
  account?: AccountType;
};
const ListItem = ({ account, refresh }: ListItemProps) => {
  const [showSSH, setShowSSH] = useState<string | null>(null);
  const { toast } = useToast();

  const handleShowSSHKey = async (pressed: boolean) => {
    if (!pressed) {
      setShowSSH(null);
      return;
    }
    try {
      const sshKey = await invoke("get_ssh_key", { email: account?.email });
      setShowSSH(sshKey as string);
    } catch (error: any) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Failed to fetch SSH key",
        description: error?.message,
      });
    }
  };

  const handleRemoveAccount = async () => {
    try {
      await invoke("remove_account", { email: account?.email });
      toast({
        title: `Account removed successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to remove account",
        description: error?.message,
      });
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await invoke("switch_account", { email: account?.email });
      toast({
        title: `Switched to account: ${account?.email}`,
      });
      refresh?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to switch account",
        description: error?.message,
      });
    }
  };

  return (
    <div className="flex rounded-md bg-accent text-accent-foreground px-4 py-2 flex-col gap-2">
      <div className="flex justify-between">
        <p className="font-bold text-2xl capitalize">{account?.name}</p>
        <div className="flex gap-2">
          <Toggle
            size="sm"
            onPressedChange={handleShowSSHKey}
            pressed={showSSH !== null}
          >
            {showSSH === null ? "Show" : "Hide"} SSH Keys
          </Toggle>
          {!account?.is_active && (
            <Button
              onClick={handleRemoveAccount}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          )}
          {!account?.is_active && (
            <Button onClick={handleSwitchAccount} size="sm" variant="outline">
              Switch
            </Button>
          )}
        </div>
      </div>
      {showSSH !== null && <Textarea readOnly value={showSSH} />}
      <Separator />
      <div className="flex flex-col gap-1">
        <p>
          <b className="font-bold mr-2">Name:</b>
          {account?.name}
        </p>
        <p>
          <b className="font-bold mr-2">Email:</b>
          {account?.email}
        </p>
        <div>
          <b className="font-bold mr-2">Status:</b>
          {account?.is_active ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const initInputData = {
  name: "",
  email: "",
};
type AddPageProps = {
  onSubmit?: (values: { name: string; email: string }) => Promise<boolean>;
};
const AddPage = ({ onSubmit }: AddPageProps) => {
  const [inputData, setInputData] = useState(initInputData);
  const [inputErrors, setInputErrors] = useState<{
    [key: string]: string;
  } | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    const value = e.target.value;
    setInputData({
      ...inputData,
      [key]: value,
    });
    if (key === "name" && inputErrors?.name) {
      if (!(value?.length < 1)) {
        setInputErrors((prev) => ({ ...prev, name: "" }));
      }
    }
    if (key === "email" && inputErrors?.email) {
      if (validateEmail(value)) {
        setInputErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  const onAddAccount = async () => {
    const errors: any = {};
    if (inputData.name?.length < 1) {
      errors.name = "invalid name";
    }
    if (!validateEmail(inputData.email)) {
      errors.email = "invalid email";
    }
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }
    const res = await onSubmit?.({
      name: inputData.name,
      email: inputData.email,
    });
    if (res) {
      setInputData(initInputData);
    }
  };

  return (
    <div className="flex-1 p-3 flex flex-col gap-4 overflow-auto">
      <label className="flex flex-col gap-1" htmlFor="name">
        <span>Name (Required)</span>
        <Input
          id="name"
          name="name"
          value={inputData.name}
          onChange={onChange}
        />
        {inputErrors?.name && (
          <span className="text-destructive text-sm">{inputErrors.name}</span>
        )}
      </label>
      <label className="flex flex-col gap-1" htmlFor="email">
        <span>Email (Required)</span>
        <Input
          id="email"
          name="email"
          type="email"
          value={inputData.email}
          onChange={onChange}
        />
        {inputErrors?.email && (
          <span className="text-destructive text-sm">{inputErrors.email}</span>
        )}
      </label>
      <div className="flex gap-2">
        <Button onClick={onAddAccount}>Add Account</Button>
      </div>
    </div>
  );
};
