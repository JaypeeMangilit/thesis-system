import { useEffect, useState } from "react";
import { MainApp } from "./styled";
import {Heading, Text, Button} from '@chakra-ui/react';

export const App = () => {
  const storageKeyName = "count";

  const retrieveCountValue = () => Number(localStorage.getItem(storageKeyName) || 0);

  const [count, setCount] = useState(retrieveCountValue());

  const addNumber = (count) => setCount(Number(count) + 1);

  useEffect(() => {
    localStorage.setItem(storageKeyName, String(count));
  }, [count]);

  return (
    <MainApp>
      <Heading>ang baho mo</Heading>
      <Text>talaga ba?</Text>
      <Text color={"tomato"}>Count Me</Text>
      <Button colorScheme="teal" variant="solid" onClick={() => addNumber(count)}>count is{count}

      </Button>
    </MainApp>
  );
};
