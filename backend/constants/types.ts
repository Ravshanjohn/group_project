export type CreateExercisePayload = {
  position: number;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_time: number;
  estimated_time_unit: "minutes" | "hours";
  status: "pending" | "available" | "deleted";
  access_level: "public" | "private";
  instructor_id: number;

  languageIds: number[];
  topicIds: number[];

  signature: {
    language_id: number;
    function_name: string;
    params_json: any;          
    return_type: any;          
  };

  initialCode: {
    name: string;
    initial_code: string;
    language_id: number;
  };

  testCases: Array<{
    language_id: number;
    input_display: string;
    scenario: string;
    expected_output_json: any; 
  }>;
};