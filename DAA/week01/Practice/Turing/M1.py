class TuringMachineV1:
    def __init__(self) -> None:
        self.transition = {
            "s0" : ["s", "0", "+"],
            "s1" : ["s", "1", "+"],
            "s>" : ["s", ">", "+"],
            "s." : ["q", ".", "-"],
            "q0" : ["h", "1", "_"],
            "q1" : ["q", "0", "-"],
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
            if index < 0 or index >= len(tape):
                raise ValueError("Tape head moved out of bounds!")

            inputChar = tape[index]
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
    m1 = TuringMachineV1()
    sample_input = ">0001010."
    print(m1(sample_input))