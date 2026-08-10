class TuringMachineV3:
    def __init__(self) -> None:
        self.transition = {
            "s0" : ["s", "1", "+"],
            "s1" : ["s", "0", "+"],
            "s>" : ["s", ">", "+"],
            "s." : ["h", ".", "_"]
        }
        self.alphabet = ["0", "1"]
        self.startChar = ">"
        self.endChar = "."
    def check_valid(self, input: str):
        start = input.startswith(self.startChar)
        end  = input.endswith(self.endChar)
        if not start or not end:
            return False
        else:
            for s in input[1:-1]:
                if s not in self.alphabet:
                    return False
            return True
    def __call__(self, input: str):
        assert self.check_valid(input), "input not valid"
        current_state = "s"
        tape = list(input)
        index = 0
        while current_state != "h":
            inputChar = input[index]
            state = current_state + inputChar

            if state not in self.transition:
                raise ValueError(f"Invalid transition state: {state}")
            result = self.transition[state]

            # Update tape with new value
            tape[index] = result[1]

            # Move head
            if result[2] == "+":
                index += 1
            elif result[2] == "-":
                index -= 1

            # Update current state
            current_state = result[0]
        return "".join(tape)

class TuringMachineV2:
    def __init__(self) -> None:
        self.transition = {
            "s0" : ["s", "0", "+"],
            "s1" : ["s", "1", "+"],
            "s>" : ["s", ">", "+"],
            "s." : ["q", ".", "-"],
            "q0" : ["q", "1", "-"],
            "q1" : ["q", "0", "_"],
            "q>" : ["h", ">", "_"]
        }
        self.alphabet = ["0", "1"]
        self.startChar = ">"
        self.endChar = "."
    def check_valid(self, input: str):
        start = input.startswith(self.startChar)
        end  = input.endswith(self.endChar)
        if not start or not end:
            return False
        else:
            for s in input[1:-1]:
                if s not in self.alphabet:
                    return False
            return True
    def __call__(self, input: str):
        assert self.check_valid(input), "input not valid"
        current_state = "s"
        tape = list(input)
        index = 0
        while current_state != "h":
            inputChar = input[index]
            state = current_state + inputChar

            if state not in self.transition:
                raise ValueError(f"Invalid transition state: {state}")
            result = self.transition[state]

            # Update tape with new value
            tape[index] = result[1]

            # Move head
            if result[2] == "+":
                index += 1
            elif result[2] == "-":
                index -= 1

            # Update current state
            current_state = result[0]
        return "".join(tape)

if __name__ == "__main__":
    m3 = TuringMachineV3()
    sample_input = ">0001011."
    print(m3(sample_input))